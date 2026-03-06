const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取密码的函数
function getAdminPassword() {
  const passwordSetting = db.get('SELECT * FROM settings WHERE key = ?', ['admin_password']);
  if (passwordSetting) {
    return passwordSetting.value;
  }
  return process.env.ADMIN_PASSWORD || 'admin';
}

// 登录验证
router.post('/', (req, res) => {
  const { password } = req.body;
  const adminPassword = getAdminPassword();

  if (password === adminPassword) {
    // 登录成功，设置 session
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.json({ success: false, error: '密码错误' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.json({ success: true });
});

// 检查登录状态
router.get('/status', (req, res) => {
  res.json({ isLoggedIn: req.session.isAdmin || false });
});

module.exports = router;