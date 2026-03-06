const express = require('express');
const router = express.Router();
const db = require('../db');

// 验证权限的中间件（支持登录状态和API密钥两种方式）
function validateAuth(req, res, next) {
  // 首先检查登录状态
  if (req.session && req.session.isAdmin) {
    return next();
  }

  // 检查API密钥
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: '需要登录或提供API密钥' });
  }

  try {
    const result = db.get('SELECT * FROM api_keys WHERE key = ?', [apiKey]);
    if (!result) {
      return res.status(401).json({ error: '无效的API密钥' });
    }
    next();
  } catch (error) {
    console.error('验证API密钥失败:', error);
    return res.status(500).json({ error: '验证失败' });
  }
}

// 生成随机API密钥
function generateApiKey() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 获取所有API密钥
router.get('/', validateAuth, (req, res) => {
  db.all('SELECT * FROM api_keys ORDER BY created_at DESC', (err, apiKeys) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(apiKeys);
  });
});

// 获取单个API密钥
router.get('/:id', validateAuth, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM api_keys WHERE id = ?', [id], (err, apiKey) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!apiKey) {
      return res.status(404).json({ error: 'API密钥不存在' });
    }
    res.json(apiKey);
  });
});

// 创建API密钥
router.post('/', validateAuth, (req, res) => {
  const { description, key } = req.body;
  const apiKey = key || generateApiKey();
  
  db.run(
    'INSERT INTO api_keys (key, description) VALUES (?, ?)',
    [apiKey, description || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, key: apiKey, description, message: 'API密钥创建成功' });
    }
  );
});

// 更新API密钥
router.put('/:id', validateAuth, (req, res) => {
  const { id } = req.params;
  const { description, key } = req.body;
  
  if (key) {
    db.run(
      'UPDATE api_keys SET description = ?, key = ? WHERE id = ?',
      [description || '', key, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'API密钥不存在' });
        }
        res.json({ message: 'API密钥更新成功' });
      }
    );
  } else {
    db.run(
      'UPDATE api_keys SET description = ? WHERE id = ?',
      [description || '', id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'API密钥不存在' });
        }
        res.json({ message: 'API密钥更新成功' });
      }
    );
  }
});

// 重置API密钥
router.post('/:id/reset', validateAuth, (req, res) => {
  const { id } = req.params;
  const newKey = generateApiKey();
  
  db.run(
    'UPDATE api_keys SET key = ? WHERE id = ?',
    [newKey, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'API密钥不存在' });
      }
      res.json({ key: newKey, message: 'API密钥重置成功' });
    }
  );
});

// 删除API密钥
router.delete('/:id', validateAuth, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM api_keys WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'API密钥不存在' });
    }
    res.json({ message: 'API密钥删除成功' });
  });
});

module.exports = router;