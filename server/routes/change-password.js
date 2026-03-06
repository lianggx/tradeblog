const express = require('express');
const router = express.Router();
const db = require('../db');

// 验证登录状态
function validateAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: '需要登录后才能修改密码' });
}

// 获取当前密码
router.get('/', validateAuth, (req, res) => {
  const passwordSetting = db.get('SELECT * FROM settings WHERE key = ?', ['admin_password']);
  res.json({ hasPassword: !!passwordSetting });
});

// 修改密码
router.post('/', validateAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: '请提供当前密码和新密码' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码长度至少为6位' });
  }

  // 从环境变量或设置中获取当前密码进行验证
  const envPassword = process.env.ADMIN_PASSWORD || 'admin';
  const passwordSetting = db.get('SELECT * FROM settings WHERE key = ?', ['admin_password']);
  const storedPassword = passwordSetting ? passwordSetting.value : envPassword;

  if (currentPassword !== storedPassword) {
    return res.status(401).json({ error: '当前密码不正确' });
  }

  // 更新密码到 settings 表
  try {
    const existingSetting = db.get('SELECT * FROM settings WHERE key = ?', ['admin_password']);
    if (existingSetting) {
      db.run('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?', [newPassword, 'admin_password']);
    } else {
      db.run('INSERT INTO settings (key, value) VALUES (?, ?)', ['admin_password', newPassword]);
    }
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

module.exports = router;