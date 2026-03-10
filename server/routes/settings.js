const express = require('express');
const router = express.Router();

// 导入数据库
const db = require('../db');

// 获取所有设置
router.get('/', (req, res) => {
  try {
    const settings = db.all('SELECT key, value FROM settings');
    
    // 转换为键值对格式
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });
    
    res.json(settingsObject);
  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({ error: '获取设置失败' });
  }
});

// 更新设置
router.put('/', (req, res) => {
  try {
    const { site_name, site_tagline, site_copyright } = req.body;
    
    // 更新网站名称
    db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['site_name', site_name]);
    
    // 更新网站副标题
    db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['site_tagline', site_tagline]);
    
    // 更新网站版权信息
    db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)', ['site_copyright', site_copyright]);
    
    res.json({ message: '设置保存成功' });
  } catch (error) {
    console.error('保存设置失败:', error);
    res.status(500).json({ error: '保存设置失败' });
  }
});

module.exports = router;