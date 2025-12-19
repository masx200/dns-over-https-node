import { query } from "./index.js";

(async () => {
  console.log("=== 简单测试强制IP功能 ===");

  try {
    console.log("\n🔹 测试传入 forcedIP 参数");

    // 测试1: 使用传入的强制IP
    const result1 = await query({
      name: "baidu.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/",
      method: "GET",
      type: "A",
      forcedIP: "104.21.9.230"
    });

    console.log("✅ 强制IP测试成功!");
    console.log("baidu.com IP:", result1.answers?.[0]?.data);

    // 测试2: 不使用强制IP（使用映射表）
    const result2 = await query({
      name: "taobao.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/",
      method: "GET",
      type: "A",
      // 不传 forcedIP，会使用映射表
    });

    console.log("✅ 映射表测试成功!");
    console.log("taobao.com IP:", result2.answers?.[0]?.data);

    console.log("\n🎉 强制DNS解析功能正常工作！");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
})();