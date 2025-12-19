# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## 项目概述

这是一个基于 Node.js 的 DNS-over-HTTPS (DoH) 客户端库，实现了 RFC-8484
标准。项目采用简洁的设计，提供了一个核心 API `doh.query()` 用于执行
DNS-over-HTTPS 查询。

## 常用开发命令

### 基础操作

```bash
# 运行示例应用
npm start

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run coverage

# 代码格式化检查
npm run prettier:check

# 代码风格检查
npm run eslint
```

## 项目架构

### 核心文件结构

- `index.js` - 主入口文件，包含所有核心实现（103行）
- `index.test.js` - 完整的测试套件（258行）
- `example/index.js` - 使用示例

### 主要函数

1. **`query(options)`** - 对外暴露的主 API，执行 DNS-over-HTTPS 查询
2. **`getDnsQuery()`** - 创建 DNS 查询包
3. **`getDnsWireformat()`** - 将 DNS 查询编码为二进制格式
4. **`getOptions()`** - 准备 HTTP 请求选项

### 核心工作流程

1. **查询创建** - 使用 `dns-packet` 创建符合标准的 DNS 查询包
2. **编码格式** - 将 DNS 查询转换为二进制格式（wire format）
3. **HTTP 请求** - 支持 GET 和 POST 两种方法：
   - POST: DNS 消息放在请求体中
   - GET: DNS 消息经过 Base64URL 编码后作为查询参数
4. **响应处理** - 解析返回的 DNS 响应，处理各种 HTTP 状态码

### 依赖说明

- **`dns-packet`** - DNS 包的编码/解码，遵循 RFC 标准
- **`base64url`** - URL 安全的 Base64 编码，用于 GET 请求
- **`undici`** - 现代化的 HTTP 客户端（当前版本未直接使用）

## 开发规范

### 代码风格

- 使用 ESLint 进行代码检查，配置规则：2空格缩进、单引号、分号结尾
- 使用 Prettier 格式化代码，行长限制 80 字符
- 行尾符使用 Unix 风格 (\n)

### 测试要求

- 使用 Jest 作为测试框架
- 测试覆盖所有公共 API 和错误场景
- 使用 Mock 模拟 HTTP/HTTPS 请求进行单元测试

### API 设计原则

- 所有函数返回 Promise
- 默认使用 Cloudflare DNS (cloudflare-dns.com)
- 支持 HTTP 和 HTTPS 协议
- 支持所有标准 DNS 记录类型（A、AAAA、TXT、MX 等）
- 支持 IN 和 CH 类别

## 示例用法

```javascript
const doh = require("./index.js");

// 基本查询
await doh.query({ name: "example.com" });

// GET 方法查询 AAAA 记录
await doh.query({
  name: "example.com",
  method: "GET",
  type: "AAAA",
});

// 使用 Google DNS
await doh.query({
  name: "example.com",
  hostname: "dns.google.com",
  path: "/experimental",
});

// CH 类别查询
await doh.query({
  name: "authors.bind",
  type: "TXT",
  klass: "CH",
});
```

## 注意事项

- DNS 查询 ID 固定为 0，符合 RFC-8484 要求
- HTTP 状态码 400、413、415、504 被视为可预期的错误
- 错误处理通过 Promise rejection 传递
- 保持向后兼容性，公共 API 不会发生破坏性变更
