import { query } from "./index.js";

(async () => {
  console.log("=== 测试 deno DNS over HTTPS 服务器强制解析 ===");

  try {
    // 测试新的deno服务器强制DNS解析
    console.log("\n开始测试 deno-dns-over-https-server...");

    const result = await query({
      name: "google.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/",
      method: "GET",
      type: "A",
    });

    console.log("\n✅ 测试成功！");
    console.log("DNS响应结果:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ 测试失败:");
    console.error("错误信息:", error.message);
    console.error("错误堆栈:", error.stack);
  }
})();
