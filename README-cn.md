# Node.js DNS-over-HTTPS API

[`@masx200/dns-over-https-node`](https://www.npmjs.com/package/@masx200/dns-over-https-node) 是一个符合 RFC-8484 标准的 Node.js [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) API。

[![CircleCI](https://circleci.com/gh/sagi/dns-over-https-node.svg?style=svg)](https://circleci.com/gh/sagi/dns-over-https-node)
[![Coverage Status](https://coveralls.io/repos/github/sagi/dns-over-https-node/badge.svg?branch=master)](https://coveralls.io/github/sagi/dns-over-https-node?branch=master)
[![MIT License](https://img.shields.io/npm/l/@masx200/dns-over-https-node.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@masx200/dns-over-https-node.svg?style=flat-square)](http://npm.im/@masx200/dns-over-https-node)

## 安装

```bash
$ npm install --save @masx200/dns-over-https-node
```

## API

我们按以下方式导入：

```js
const doh = require("@masx200/dns-over-https-node");
```

#### doh.query(...)

```js
doh.query = {
  name,
  method: "POST",
  hostname: "cloudflare-dns.com",
  path: "/dns-query",
  port: 443,
  userAgent: "@masx200/dns-over-https-node",
  type: "A",
  klass: "IN",
  useHttps: true,
};
```

`name` 参数是必需的。您可以设置自己的 `method`、`hostname`、`path`、`port`、`userAgent`、`type`、`klass` 和 `useHttps`。

返回一个解析为 `DNS` 响应对象的 `Promise`。

例如：

```js
const doh = require("@masx200/dns-over-https-node");
(async () => {
  const dnsResponse = await doh.query({ name: "sagi.io" });
})();
```

结果：

```json
{
  "id": 0,
  "type": "response",
  "flags": 384,
  "flag_qr": true,
  "opcode": "QUERY",
  "flag_aa": false,
  "flag_tc": false,
  "flag_rd": true,
  "flag_ra": true,
  "flag_z": false,
  "flag_ad": false,
  "flag_cd": false,
  "rcode": "NOERROR",
  "questions": [
    {
      "name": "sagi.io",
      "type": "A",
      "class": "IN"
    }
  ],
  "answers": [
    {
      "name": "sagi.io",
      "type": "A",
      "ttl": 300,
      "class": "IN",
      "flush": false,
      "data": "151.101.1.195"
    },
    {
      "name": "sagi.io",
      "type": "A",
      "ttl": 300,
      "class": "IN",
      "flush": false,
      "data": "151.101.65.195"
    }
  ],
  "authorities": [],
  "additionals": []
}
```

更多使用示例可以在 [`example`](https://github.com/masx200/dns-over-https-node/blob/master/example/index.js) 中找到。

## 许可证

MIT