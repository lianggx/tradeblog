const express = require('express');
const router = express.Router();
const db = require('../db');

// 生成slug
function generateSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

// 获取所有分类
router.get('/', (req, res) => {
  try {
    const categories = db.all('SELECT * FROM categories ORDER BY id DESC');
    res.json(categories);
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 获取单个分类
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const category = db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: '分类不存在' });
    }
    res.json(category);
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 创建分类
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '分类名称不能为空' });
    }
    
    const slug = generateSlug(name);
    const result = db.run('INSERT INTO categories (name, slug) VALUES (?, ?)', [name.trim(), slug]);
    
    res.status(201).json({ 
      id: result.lastID, 
      name: name.trim(), 
      slug,
      message: '分类创建成功' 
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: '分类名称或slug已存在' });
    }
    res.status(500).json({ error: '创建分类失败' });
  }
});

// 更新分类
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '分类名称不能为空' });
    }
    
    // 检查分类是否存在
    const existingCategory = db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existingCategory) {
      return res.status(404).json({ error: '分类不存在' });
    }
    
    const slug = generateSlug(name);
    db.run('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name.trim(), slug, id]);
    
    res.json({ 
      id: parseInt(id), 
      name: name.trim(), 
      slug,
      message: '分类更新成功' 
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: '分类名称或slug已存在' });
    }
    res.status(500).json({ error: '更新分类失败' });
  }
});

// 删除分类
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查分类是否存在
    const existingCategory = db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existingCategory) {
      return res.status(404).json({ error: '分类不存在' });
    }
    
    // 检查是否有文章使用该分类
    const articlesWithCategory = db.get('SELECT COUNT(*) as count FROM articles WHERE category_id = ?', [id]);
    if (articlesWithCategory.count > 0) {
      return res.status(400).json({ error: '该分类下还有文章，无法删除' });
    }
    
    db.run('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ error: '删除分类失败' });
  }
});

module.exports = router;
