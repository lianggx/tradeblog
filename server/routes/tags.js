const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有标签
router.get('/', (req, res) => {
  db.all('SELECT * FROM tags', (err, tags) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(tags);
  });
});

// 获取单个标签
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tags WHERE id = ?', [id], (err, tag) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  });
});

module.exports = router;
