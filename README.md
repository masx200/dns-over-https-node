# DNS-over-HTTPS API for Node.js

[`@masx200/dns-over-https-node`](https://www.npmjs.com/package/@masx200/dns-over-https-node)
is an RFC-8484 compliant Node.js
[DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) API.

[![CircleCI](https://circleci.com/gh/masx200/dns-over-https-node.svg?style=svg)](https://circleci.com/gh/masx200/dns-over-https-node)
[![Coverage Status](https://coveralls.io/repos/github/masx200/dns-over-https-node/badge.svg?branch=master)](https://coveralls.io/github/masx200/dns-over-https-node?branch=master)
[![MIT License](https://img.shields.io/npm/l/@masx200/dns-over-https-node.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@masx200/dns-over-https-node.svg?style=flat-square)](http://npm.im/@masx200/dns-over-https-node)

## Installation

```
$ npm install --save @masx200/dns-over-https-node
```

## API

We import as follows:

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

A `name` is mandatory. You can set your own `method`, `hostname`, `path`,
`port`, `userAgent`, `type`, `klass` and `useHttps`.

A `Promise` that resolves to a `DNS` response object is returned.

For instance,

```js
const doh = require("@masx200/dns-over-https-node")(async () => {
  const dnsResponse = await doh.query({ name: "dns.google" });
})();
```

Results in:

```
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
      "name": "dns.google",
      "type": "A",
      "class": "IN"
    }
  ],
  "answers": [
    {
      "name": "dns.google",
      "type": "A",
      "ttl": 300,
      "class": "IN",
      "flush": false,
      "data": "151.101.1.195"
    },
    {
      "name": "dns.google",
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

More usage examples can be found in
[`example`](https://github.com/masx200/dns-over-https-node/blob/master/example/index.js).

## License

MIT
