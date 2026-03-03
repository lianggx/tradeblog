const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

// 加载环境变量
dotenv.config();

// 初始化数据库
const db = require('./db');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 中间件
app.use(session({
  secret: process.env.SESSION_SECRET || 'tradeblog-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../client/dist')));

// 管理后台路由 - 需要登录验证
app.use('/admin', (req, res, next) => {
  // 允许访问登录页面
  if (req.path === '/login.html' || req.path === '/login') {
    return next();
  }
  
  // 检查登录状态
  if (req.session.isAdmin) {
    return next();
  }
  
  // 未登录，重定向到登录页面
  res.redirect('/admin/login.html');
}, express.static(path.join(__dirname, 'admin')));

// API 路由
app.use('/api', require('./routes'));

// 前端路由 fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
