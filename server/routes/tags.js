const express = require('express');
const router = express.Router();
const db = require('../db');

// 生成slug
function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

// 获取所有标签
router.get('/', (req, res) => {
  try {
    const tags = db.all('SELECT * FROM tags ORDER BY id DESC');
    res.json(tags);
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 获取单个标签
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const tag = db.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!tag) {
      return res.status(404).json({ error: '标签不存在' });
    }
    res.json(tag);
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 创建标签
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '标签名称不能为空' });
    }
    
    const slug = generateSlug(name);
    const result = db.run('INSERT INTO tags (name, slug) VALUES (?, ?)', [name.trim(), slug]);
    
    res.status(201).json({ 
      id: result.lastID, 
      name: name.trim(), 
      slug,
      message: '标签创建成功' 
    });
  } catch (error) {
    console.error('创建标签失败:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: '标签名称或slug已存在' });
    }
    res.status(500).json({ error: '创建标签失败' });
  }
});

// 更新标签
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '标签名称不能为空' });
    }
    
    // 检查标签是否存在
    const existingTag = db.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existingTag) {
      return res.status(404).json({ error: '标签不存在' });
    }
    
    const slug = generateSlug(name);
    db.run('UPDATE tags SET name = ?, slug = ? WHERE id = ?', [name.trim(), slug, id]);
    
    res.json({ 
      id: parseInt(id), 
      name: name.trim(), 
      slug,
      message: '标签更新成功' 
    });
  } catch (error) {
    console.error('更新标签失败:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: '标签名称或slug已存在' });
    }
    res.status(500).json({ error: '更新标签失败' });
  }
});

// 删除标签
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查标签是否存在
    const existingTag = db.get('SELECT * FROM tags WHERE id = ?', [id]);
    if (!existingTag) {
      return res.status(404).json({ error: '标签不存在' });
    }
    
    // 删除文章标签关联
    db.run('DELETE FROM article_tags WHERE tag_id = ?', [id]);
    
    // 删除标签
    db.run('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ message: '标签删除成功' });
  } catch (error) {
    console.error('删除标签失败:', error);
    res.status(500).json({ error: '删除标签失败' });
  }
});

module.exports = router;