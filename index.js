import base64url from "base64url";
import dnsPacket from "dns-packet";
import { Agent, fetch } from "undici";
import { lookup } from "dns";

/**
 * 强制DNS映射表
 * 特定域名强制解析到指定IP地址
 */
const FORCED_DNS_MAPPING = {
  "fresh-reverse-proxy-middle.masx201.dpdns.org": "104.21.9.230",
  "deno-dns-over-https-server.g18uibxgnb.de5.net": "104.21.9.230",
};

/**
 * 创建自定义Agent，用于强制DNS解析
 * 简化版本，专注于DNS解析劫持
 * @param {string} hostname - 要连接的主机名
 * @returns {Agent} 自定义Agent实例
 */
function createCustomAgent(hostname) {
  return new Agent({
    connect: {
      // 使用标准的callback风格的lookup函数
      lookup: (hostname, options, callback) => {
        console.log(`🔍 正在解析: ${hostname}`);

        // 检查是否在强制映射表中
        if (FORCED_DNS_MAPPING[hostname]) {
          const forcedIP = FORCED_DNS_MAPPING[hostname];
          console.log(`🔒 强制DNS解析: ${hostname} -> ${forcedIP}`);

          // 根据Node.js dns.LookupOptions的格式返回
          // 可以返回单个地址或地址数组
          if (options && options.all) {
            return callback(null, [{ address: forcedIP, family: 4 }]);
          } else {
            return callback(null, forcedIP, 4);
          }
        }

        // 对于其他域名，使用标准DNS解析
        lookup(hostname, options, callback);
      },
    },
  });
}

const getDnsQuery = ({ type, name, klass, id }) => ({
  type: "query",
  id,
  flags: dnsPacket.RECURSION_DESIRED,
  questions: [
    {
      ["class"]: klass,
      name,
      type,
    },
  ],
});

const getDnsWireformat = ({ name, type, klass }) => {
  const id = 0; // As mandated by RFC-8484.
  const dnsQuery = getDnsQuery({ type, name, klass, id });
  const dnsQueryBuf = dnsPacket.encode(dnsQuery);
  return dnsQueryBuf;
};

const getOptions = ({
  method,
  userAgent,
  port,
  hostname,
  path,
  name,
  type,
  klass,
}) => {
  const dnsWireformat = getDnsWireformat({ name, type, klass });
  const isPost = method === "POST";
  const dohPath = isPost ? path : `${path}?dns=${base64url(dnsWireformat)}`;
  const headers = {
    accept: "application/dns-message",
    "User-Agent": userAgent,
    ...(isPost && {
      "content-type": "application/dns-message",
      "content-length": dnsWireformat.length,
    }),
  };
  return { hostname, headers, method, path: dohPath, port };
};

const query = async ({
  name,
  method = "POST",
  hostname = "cloudflare-dns.com",
  path = "/dns-query",
  port = 443,
  userAgent = "@masx200/dns-over-https-node",
  type = "A",
  klass = "IN",
  useHttps = true,
}) => {
  try {
    // 创建自定义Agent用于强制DNS解析
    const customAgent = createCustomAgent(hostname);

    // 构建请求URL
    const protocol = useHttps ? "https" : "http";
    const url = new URL(`${protocol}://${hostname}:${port}${path}`);

    // 获取DNS查询的二进制数据
    const dnsWireformat = getDnsWireformat({ name, type, klass });

    // 准备请求选项
    const fetchOptions = {
      method,
      dispatcher: customAgent,
      headers: {
        "accept": "application/dns-message",
        "User-Agent": userAgent,
        "Cache-Control": "no-cache",
      },
    };

    console.log(`🌐 使用强制DNS解析请求: ${url.toString()}`);
    console.log(`🔧 目标DNS解析器: ${hostname}`);
    if (FORCED_DNS_MAPPING[hostname]) {
      console.log(
        `🎯 强制映射: ${hostname} -> ${FORCED_DNS_MAPPING[hostname]}`,
      );
    }

    // 根据请求方法设置请求体
    if (method === "POST") {
      fetchOptions.headers["content-type"] = "application/dns-message";
      fetchOptions.headers["content-length"] = dnsWireformat.length;
      fetchOptions.body = dnsWireformat;
    } else {
      // GET方法：将DNS查询作为Base64URL编码的查询参数
      url.searchParams.set("dns", base64url(dnsWireformat));
    }

    // 发起请求
    const response = await fetch(url.toString(), fetchOptions);

    // 检查响应状态
    switch (response.status) {
      case 200:
        const contentType = response.headers.get("content-type");
        console.log(`📦 响应数据类型: ${contentType}`);

        try {
          // 首先尝试以二进制方式读取数据
          const responseData = await response.arrayBuffer();
          const uint8Array = new Uint8Array(responseData);
          console.log(`📦 响应数据长度: ${uint8Array.length} 字节`);

          // 如果响应声明为JSON格式，尝试JSON解析
          if (contentType && contentType.includes("application/json")) {
            const responseText = new TextDecoder().decode(uint8Array);
            const jsonResponse = JSON.parse(responseText);
            console.log(`📄 成功解析为JSON格式`);
            return jsonResponse;
          }

          // 否则尝试DNS二进制解码
          console.log(
            `📦 二进制数据前20字节:`,
            Array.from(uint8Array.slice(0, 20)),
          );

          // 将Uint8Array转换为Buffer以兼容dns-packet
          const dnsResponse = dnsPacket.decode(Buffer.from(uint8Array));
          console.log(`✅ DNS解析成功: ${name}`);
          return dnsResponse;
        } catch (decodeError) {
          console.log(`❌ DNS解码失败: ${decodeError.message}`);
          return `DNS解码失败: ${decodeError.message}`;
        }
      case 400:
      case 413:
      case 415:
      case 504:
        const errorText = await response.text();
        console.log(`❌ DNS解析错误[${response.status}]: ${errorText}`);
        return `Error[${response.status}]: ${errorText}`;
      default:
        console.log(`❌ 不支持的HTTP状态码: ${response.status}`);
        return `Error[${response.status}]: Unsupported HTTP status code - ${response.status}`;
    }
  } catch (error) {
    console.log(`❌ DNS解析失败: ${error.message}`);
    throw new Error(`DNS 解析过程中发生错误: ${error.message}`);
  }
};

export { getDnsQuery, getDnsWireformat, getOptions, query };
