# DoH 服务器强制 DNS 解析指南

## 概述

本库支持对特定的 DNS-over-HTTPS (DoH) 服务器进行强制 DNS
解析，允许您将指定的域名强制解析到预设的 IP 地址。这对于网络代理、CDN
加速、访问控制等场景非常有用。

## 功能特性

- 🔒 **DNS 解析劫持**：强制将特定域名解析到指定 IP
- 🌐 **多服务器支持**：支持配置多个 DoH 服务器的强制解析
- 📦 **自动检测**：自动检测需要强制解析的域名
- 🚀 **高性能**：基于 undici 的现代化 HTTP 客户端
- 🛡️ **标准兼容**：完全符合 RFC-8484 DoH 标准

## 配置方法

### 1. 编辑强制 DNS 映射表

在 `index.js` 文件中找到 `FORCED_DNS_MAPPING` 对象：

```javascript
/**
 * 强制DNS映射表
 * 特定域名强制解析到指定IP地址
 */
const FORCED_DNS_MAPPING = {
  "fresh-reverse-proxy-middle.masx201.dpdns.org": "104.21.9.230",
  "deno-dns-over-https-server.g18uibxgnb.de5.net": "104.21.9.230",
  // 在这里添加更多的强制解析规则
  "your-doh-server.example.com": "192.168.1.100",
};
```

### 2. 添加新的强制解析规则

要添加新的强制解析规则，只需在 `FORCED_DNS_MAPPING` 对象中添加键值对：

```javascript
const FORCED_DNS_MAPPING = {
  // 现有规则
  "fresh-reverse-proxy-middle.masx201.dpdns.org": "104.21.9.230",

  // 新增规则
  "custom-doh-server.yourdomain.com": "10.0.0.1",
  "backup-doh-server.yourdomain.com": "10.0.0.2",
};
```

## 使用示例

### 基本用法

```javascript
import { query } from "@masx200/dns-over-https-node";

// 使用强制解析的 DoH 服务器
const result = await query({
  name: "google.com",
  hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
  path: "/dns-query",
  method: "GET",
  type: "A",
});

console.log("DNS 查询结果:", result);
```

### 完整示例

```javascript
import { query } from "@masx200/dns-over-https-node";

(async () => {
  try {
    // 测试强制 DNS 解析
    console.log("=== 测试强制 DNS 解析功能 ===");

    // 1. 使用标准 DoH 服务器
    const normalResult = await query({
      name: "baidu.com",
      hostname: "cloudflare-dns.com",
      path: "/dns-query",
      method: "GET",
    });
    console.log("标准 DoH 结果:", normalResult.answers);

    // 2. 使用强制解析的 DoH 服务器
    const forcedResult = await query({
      name: "baidu.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/",
      method: "GET",
    });
    console.log("强制解析 DoH 结果:", forcedResult.answers);
  } catch (error) {
    console.error("查询失败:", error.message);
  }
})();
```

## 工作原理

### 1. DNS 解析劫持机制

```javascript
function createCustomAgent(hostname) {
  return new Agent({
    connect: {
      lookup: (hostname, options, callback) => {
        console.log(`🔍 正在解析: ${hostname}`);

        // 检查是否在强制映射表中
        if (FORCED_DNS_MAPPING[hostname]) {
          const dohforcedIP = FORCED_DNS_MAPPING[hostname];
          console.log(`🔒 强制DNS解析: ${hostname} -> ${dohforcedIP}`);

          // 返回强制解析的 IP
          return callback(null, dohforcedIP, 4);
        }

        // 对于其他域名，使用标准DNS解析
        lookup(hostname, options, callback);
      },
    },
  });
}
```

### 2. 执行流程

1. **域名检查**：检查请求的 DoH 服务器域名是否在强制映射表中
2. **IP 返回**：如果在表中，直接返回预设的 IP 地址
3. **连接建立**：使用返回的 IP 建立 HTTPS 连接
4. **DoH 查询**：正常执行 DNS-over-HTTPS 查询
5. **结果返回**：返回 DNS 查询结果

## 调试信息

当启用强制 DNS 解析时，会输出详细的调试信息：

```
🌐 使用强制DNS解析请求: https://deno-dns-over-https-server.g18uibxgnb.de5.net/
🔧 目标DNS解析器: deno-dns-over-https-server.g18uibxgnb.de5.net
🎯 强制映射: deno-dns-over-https-server.g18uibxgnb.de5.net -> 104.21.9.230
🔍 正在解析: deno-dns-over-https-server.g18uibxgnb.de5.net
🔒 强制DNS解析: deno-dns-over-https-server.g18uibxgnb.de5.net -> 104.21.9.230
📦 响应数据类型: application/dns-message
📦 响应数据长度: 44 字节
📦 二进制数据前20字节: [0, 0, 129, 128, 0, 1, 0, 1, 0, 0, 0, 0, 6, 103, 111, 111, 103, 108, 101, 3]
✅ DNS解析成功: google.com
```

## 应用场景

### 1. 网络代理和加速

```javascript
// 将国内 DoH 服务器的 DNS 查询路由到海外 CDN 节点
const FORCED_DNS_MAPPING = {
  "china-dns-server.example.com": "104.21.9.230", // 海外 CDN 节点
};
```

### 2. 负载均衡

```javascript
// 将多个 DoH 服务器路由到不同的后端实例
const FORCED_DNS_MAPPING = {
  "doh1.example.com": "10.0.1.10",
  "doh2.example.com": "10.0.1.20",
  "doh3.example.com": "10.0.1.30",
};
```

### 3. 访问控制和路由

```javascript
// 将特定地区的 DoH 服务器路由到本地节点
const FORCED_DNS_MAPPING = {
  "asia-doh.example.com": "192.168.1.100",
  "europe-doh.example.com": "192.168.2.100",
  "usa-doh.example.com": "192.168.3.100",
};
```

## 性能优化

### 1. 连接复用

undici Agent 自动处理连接复用，提高性能：

```javascript
// 自动复用到同一强制解析 IP 的连接
const agent = createCustomAgent("doh-server.example.com");
```

### 2. 缓存策略

可以在应用层添加缓存来减少重复的 DNS 查询：

```javascript
const dnsCache = new Map();

async function cachedQuery(options) {
  const cacheKey = JSON.stringify(options);

  if (dnsCache.has(cacheKey)) {
    return dnsCache.get(cacheKey);
  }

  const result = await query(options);
  dnsCache.set(cacheKey, result);
  return result;
}
```

## 安全考虑

### 1. 证书验证

强制 DNS 解析不会影响 HTTPS 证书验证，确保连接安全性：

```javascript
// 仍然会验证服务器证书的域名匹配
// 即使连接到强制解析的 IP 地址
```

### 2. IP 地址验证

建议只信任可信的 IP 地址：

```javascript
const TRUSTED_IPS = ["104.21.9.230", "192.168.1.100"];

function validatedohforcedIP(hostname, ip) {
  if (!TRUSTED_IPS.includes(ip)) {
    throw new Error(`不受信任的 IP 地址: ${ip} 用于域名: ${hostname}`);
  }
}
```

## 故障排除

### 1. 常见问题

**问题：强制解析不生效**

```
解决方案：检查 FORCED_DNS_MAPPING 中是否包含目标域名
```

**问题：连接超时**

```
解决方案：验证强制解析的 IP 地址是否可达
```

**问题：证书错误**

```
解决方案：确保服务器支持 SNI 或使用正确的 IP 地址
```

### 2. 调试技巧

启用详细日志来调试问题：

```javascript
// 在 createCustomAgent 中添加更多调试信息
lookup: ((hostname, options, callback) => {
  console.log(`🔍 [DEBUG] 解析域名: ${hostname}`);
  console.log(`🔍 [DEBUG] 强制映射表:`, FORCED_DNS_MAPPING);

  if (FORCED_DNS_MAPPING[hostname]) {
    const dohforcedIP = FORCED_DNS_MAPPING[hostname];
    console.log(`🔒 [DEBUG] 应用强制解析: ${hostname} -> ${dohforcedIP}`);
    return callback(null, dohforcedIP, 4);
  }

  console.log(`🔍 [DEBUG] 使用标准解析: ${hostname}`);
  lookup(hostname, options, callback);
});
```

## 最佳实践

1. **配置管理**：将强制解析规则存储在配置文件中
2. **监控日志**：监控强制解析的使用情况和效果
3. **定期更新**：定期检查和更新强制解析规则
4. **备份策略**：为关键 DoH 服务器配置多个备用 IP
5. **性能测试**：定期测试强制解析的性能影响

## 总结

强制 DNS 解析功能为 DoH
客户端提供了强大的网络路由和控制能力，适用于各种复杂的网络环境。通过合理配置和使用，可以显著提升网络性能和可靠性。
