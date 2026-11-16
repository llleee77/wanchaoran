// ============================================================
//  server.js —— 诗词数据服务器（Express）
//  位置：db/server.js      端口：3005
//  启动：在 db 目录下执行  node server.js
//  接口：GET http://localhost:3005/api/poems  → 返回 db.json 里的 poems 数组
// ============================================================

const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3005;

// db.json 与本文件同级，用 __dirname 取绝对路径，避免"在哪个目录下启动"导致读不到
const DB_FILE = path.join(__dirname, 'db.json');
const PAGE_FILE = path.join(__dirname, '..', 'poems.html');

// ---- 读取数据 ----
// 每次请求都重新读文件：改完 db.json 只要刷新页面就能看到新内容，不用重启服务器
function readPoems() {
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.poems)) {
    throw new Error('db.json 结构不对，应该是 { "poems": [ ... ] }');
  }
  return data.poems;
}

// ---- 跨域放行 ----
// 直接双击打开 poems.html（file:// 协议）时，浏览器会因为"源不同"拦掉 fetch，
// 这里补上 CORS 响应头，file:// 和 http:// 两种打开方式都能取到数据。
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---- 接口：返回 poems 数组本身 ----
// 注意：接口返回的就是数组（[ {...}, {...} ]），不是 { poems: [...] }
app.get('/api/poems', function (req, res) {
  try {
    res.json(readPoems());
  } catch (err) {
    console.error('读取 db.json 失败：', err.message);
    res.status(500).json({ error: '读取 db.json 失败：' + err.message });
  }
});

// ---- 顺便把 poems.html 也托管出来，方便用 http://localhost:3005 打开 ----
app.get('/', function (req, res) {
  res.redirect('/poems.html');
});

app.get('/poems.html', function (req, res) {
  res.sendFile(PAGE_FILE, function (err) {
    if (err) res.status(404).send('找不到 poems.html，请确认它和 db 文件夹在同一层');
  });
});

// ---- 接口路径写错时给个明确提示，而不是一片空白 ----
app.use('/api', function (req, res) {
  res.status(404).json({ error: '接口不存在：' + req.originalUrl });
});

// ---- 启动 ----
const server = app.listen(PORT, function () {
  console.log('数据服务器已启动: http://localhost:' + PORT + '/api/poems');
  console.log('页面地址:      http://localhost:' + PORT + '/poems.html');
  console.log('按 Ctrl + C 停止服务');
});

server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('端口 ' + PORT + ' 已被占用：可能是上一次的服务器还在跑，先关掉那个终端窗口再启动。');
  } else {
    console.error('服务器启动失败：', err.message);
  }
  process.exit(1);
});
