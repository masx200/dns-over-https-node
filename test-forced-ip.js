import { query } from "./index.js";

(async () => {
  console.log("=== 测试 DoH 服务器强制 IP 解析功能 ===");

  try {
    // 测试1: 使用传入的强制IP参数
    console.log("\n🔹 测试1: 使用传入的强制IP参数");
    console.log(
      "将 deno-dns-over-https-server.g18uibxgnb.de5.net 强制解析到 104.21.9.230",
    );

    const result1 = await query({
      name: "google.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/", // 不带 dns-query 路径
      method: "GET",
      type: "A",
      dohforcedIP: "104.21.9.230", // 使用已知可用的IP
    });

    console.log("✅ 测试1成功！");
    console.log("DNS响应结果:", result1.answers?.[0]?.data || "无答案");

    // 测试2: 使用原有的强制解析映射表
    console.log("\n🔹 测试2: 使用原有的强制解析映射表");
    console.log(
      "使用 deno-dns-over-https-server.g18uibxgnb.de5.net (映射到 104.21.9.230)",
    );

    const result2 = await query({
      name: "baidu.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/",
      method: "GET",
      type: "A",
      // 不传 dohforcedIP ，使用映射表
    });

    console.log("✅ 测试2成功！");
    console.log("DNS响应结果:", result2.answers?.[0]?.data || "无答案");

    // 测试3: 同时使用传入IP和映射表（传入IP优先）
    console.log("\n🔹 测试3: 传入IP优先于映射表");
    console.log(
      "将 deno-dns-over-https-server.g18uibxgnb.de5.net 强制解析到 8.8.8.8",
    );

    const result3 = await query({
      name: "github.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/dns-query",
      method: "GET",
      type: "A",
      dohforcedIP: "8.8.8.8", // 这会覆盖映射表中的IP
    });

    console.log("✅ 测试3成功！");
    console.log("DNS响应结果:", result3.answers?.[0]?.data || "无答案");

    // 测试4: 标准查询（无强制解析）
    console.log("\n🔹 测试4: 标准查询（无强制解析）");
    console.log("使用 dns.google.com 进行标准DNS查询");

    const result4 = await query({
      name: "example.com",
      hostname: "dns.google.com",
      path: "/resolve",
      method: "GET",
      type: "A",
      // 无 dohforcedIP ，不在映射表中
    });

    console.log("✅ 测试4成功！");
    console.log("DNS响应结果:", result4.answers?.[0]?.data || "无答案");
  } catch (error) {
    console.error("\n❌ 测试失败:");
    console.error("错误信息:", error.message);
    console.error("错误堆栈:", error.stack);
  }
})();
