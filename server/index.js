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

// 静态文件服务 - 前端构建文件
app.use(express.static(path.join(__dirname, '../client/dist')));

// 管理后台静态资源 - 不需要验证
app.use('/admin/admin.css', express.static(path.join(__dirname, 'admin/admin.css')));

// 管理后台登录页面 - 不需要验证
app.use('/admin/login', express.static(path.join(__dirname, 'admin/login.html')));
app.use('/admin/login.html', express.static(path.join(__dirname, 'admin/login.html')));

// 管理后台其他路由 - 需要登录验证
app.use('/admin', (req, res, next) => {
  // 检查登录状态
  if (req.session.isAdmin) {
    return next();
  }
  
  // 未登录，重定向到登录页面
  res.redirect('/admin/login.html');
});

// 管理后台静态文件服务（需要登录验证）
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
  extensions: ['html']
}));

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
