const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有分类
router.get('/', (req, res) => {
  db.all('SELECT * FROM categories', (err, categories) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(categories);
  });
});

// 获取单个分类
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM categories WHERE id = ?', [id], (err, category) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  });
});

module.exports = router;
