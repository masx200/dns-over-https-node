import { query } from "../index.js";

(async () => {
  try {
    const r1 = await query({ name: "sagi.io" });
    console.log("r1 (A record):", JSON.stringify(r1, null, 2));

    const r2 = await query({ name: "sagi.io", type: "TXT" });
    console.log("r2 (TXT record):", JSON.stringify(r2, null, 2));

    const r3 = await query({ name: "sagi.io", method: "GET" });
    console.log("r3 (GET method):", JSON.stringify(r3, null, 2));

    const r4 = await query({ name: "sagi.io", method: "GET", type: "AAAA" });
    console.log("r4 (AAAA record with GET):", JSON.stringify(r4, null, 2));

    const r5 = await query({
      name: "authors.bind",
      method: "GET",
      type: "TXT",
      klass: "CH",
    });
    console.log("r5 (CHAOS class):", JSON.stringify(r5, null, 2));

    const r6 = await query({
      name: "sagi.io",
      method: "GET",
      type: "AAAA",
      hostname: "dns.google.com",
      path: "/experimental",
    });
    console.log("r6 (Google DNS):", JSON.stringify(r6, null, 2));

    // 测试强制DNS解析功能
    const r7 = await query({
      name: "example.com",
      hostname: "fresh-reverse-proxy-middle.masx201.dpdns.org",
      path: "/token/4yF6nSCifSLs8lfkb4t8OWP69kfpgiun/https/dns.google/resolve",
    });
    console.log("r7 (forced DNS):", JSON.stringify(r7, null, 2));

    // 测试新的deno服务器强制DNS解析
    const r8 = await query({
      name: "baidu.com",
      hostname: "deno-dns-over-https-server.g18uibxgnb.de5.net",
      path: "/dns-query",
      method: "GET",
    });
    console.log("r8 (deno forced DNS):", JSON.stringify(r8, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
