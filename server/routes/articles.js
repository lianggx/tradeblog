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

// 前端接口 - 只返回已发布的文章
router.get('/published', (req, res) => {
  const { page = 1, limit = 10, categoryId, tagId } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT a.*, s.views, c.name as category_name
    FROM articles a
    LEFT JOIN article_stats s ON a.id = s.article_id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.is_published = 1
  `;

  const params = [];

  if (categoryId) {
    query += ' AND a.category_id = ?';
    params.push(categoryId);
  }

  if (tagId) {
    query += ' JOIN article_tags at ON a.id = at.article_id';
    query += ' AND at.tag_id = ?';
    params.push(tagId);
  }

  query += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取每个文章的标签
    const articlesWithTags = articles.map(article => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT t.* FROM tags t
           JOIN article_tags at ON t.id = at.tag_id
           WHERE at.article_id = ?`,
          [article.id],
          (err, tags) => {
            if (err) {
              reject(err);
            } else {
              resolve({ ...article, tags });
            }
          }
        );
      });
    });

    Promise.all(articlesWithTags)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });
});

// 前端搜索接口 - 只搜索已发布的文章
router.get('/search', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json([]);
  }

  const searchQuery = `%${query}%`;

  const sql = `
    SELECT a.*, s.views, c.name as category_name
    FROM articles a
    LEFT JOIN article_stats s ON a.id = s.article_id
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.is_published = 1
    AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)
    ORDER BY a.published_at DESC
    LIMIT 20
  `;

  db.all(sql, [searchQuery, searchQuery, searchQuery], (err, articles) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取每个文章的标签
    const articlesWithTags = articles.map(article => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT t.* FROM tags t
           JOIN article_tags at ON t.id = at.tag_id
           WHERE at.article_id = ?`,
          [article.id],
          (err, tags) => {
            if (err) {
              reject(err);
            } else {
              resolve({ ...article, tags });
            }
          }
        );
      });
    });

    Promise.all(articlesWithTags)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });
});

// 后台管理接口 - 返回所有文章（包括草稿）
router.get('/', validateAuth, (req, res) => {
  const { page = 1, limit = 10, categoryId, tagId } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT a.*, s.views, c.name as category_name
    FROM articles a
    LEFT JOIN article_stats s ON a.id = s.article_id
    LEFT JOIN categories c ON a.category_id = c.id
  `;

  const params = [];
  const conditions = [];

  if (categoryId) {
    conditions.push('a.category_id = ?');
    params.push(categoryId);
  }

  if (tagId) {
    query += ' JOIN article_tags at ON a.id = at.article_id';
    conditions.push('at.tag_id = ?');
    params.push(tagId);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, articles) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取每个文章的标签
    const articlesWithTags = articles.map(article => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT t.* FROM tags t
           JOIN article_tags at ON t.id = at.tag_id
           WHERE at.article_id = ?`,
          [article.id],
          (err, tags) => {
            if (err) {
              reject(err);
            } else {
              resolve({ ...article, tags });
            }
          }
        );
      });
    });

    Promise.all(articlesWithTags)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });
});

// 前端接口 - 只返回已发布的文章详情
router.get('/published/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM articles WHERE id = ? AND is_published = 1', [id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // 获取标签
    db.all(
      `SELECT t.* FROM tags t
       JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = ?`,
      [id],
      (err, tags) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // 获取统计信息
        db.get('SELECT * FROM article_stats WHERE article_id = ?', [id], (err, stats) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // 增加访问量
          db.run('UPDATE article_stats SET views = views + 1 WHERE article_id = ?', [id]);

          res.json({ ...article, tags, stats });
        });
      }
    );
  });
});

// 后台管理接口 - 返回所有文章详情（包括草稿）
router.get('/:id', validateAuth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // 获取标签
    db.all(
      `SELECT t.* FROM tags t
       JOIN article_tags at ON t.id = at.tag_id
       WHERE at.article_id = ?`,
      [id],
      (err, tags) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // 获取统计信息
        db.get('SELECT * FROM article_stats WHERE article_id = ?', [id], (err, stats) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({ ...article, tags, stats });
        });
      }
    );
  });
});

// 创建文章（需要权限验证）
router.post('/', validateAuth, (req, res) => {
  const { title, content, summary, coverImage, categoryId, isPublished, isFeatured, tags, status } = req.body;

  // 处理前端发送的 status 字段
  const published = status === 'published' || (isPublished ? 1 : 0);

  // 如果摘要为空，从正文中提取一小段文字作为摘要
  let finalSummary = summary;
  if (!finalSummary) {
    // 移除 HTML 标签，提取纯文本
    const plainText = content.replace(/<[^>]*>/g, '');
    // 截取前 150 个字符作为摘要
    finalSummary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }

  db.run(
    `INSERT INTO articles (title, content, summary, cover_image, category_id, is_published, is_featured, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      content,
      finalSummary,
      coverImage || null,
      categoryId || null,
      published ? 1 : 0,
      isFeatured ? 1 : 0,
      new Date().toISOString()
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 为文章创建统计信息
      db.run('INSERT INTO article_stats (article_id) VALUES (?)', [this.lastID]);

      // 为文章添加标签
      if (tags && tags.length > 0) {
        tags.forEach(tagName => {
          // 查找或创建标签
          db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, tag) => {
            if (err) {
              console.error('Error finding tag:', err.message);
              return;
            }

            if (tag) {
              // 标签存在，直接关联
              db.run('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [this.lastID, tag.id]);
            } else {
              // 标签不存在，创建新标签
              db.run(
                'INSERT INTO tags (name, slug) VALUES (?, ?)',
                [tagName, tagName.toLowerCase().replace(/\s+/g, '-')],
                function(err) {
                  if (err) {
                    console.error('Error creating tag:', err.message);
                    return;
                  }
                  db.run('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [this.lastID, this.lastID]);
                }
              );
            }
          });
        });
      }

      res.status(201).json({ id: this.lastID, message: 'Article created successfully' });
    }
  );
});

// 更新文章（需要权限验证）
router.put('/:id', validateAuth, (req, res) => {
  const { id } = req.params;
  const { title, content, summary, coverImage, categoryId, isPublished, isFeatured, tags, status } = req.body;

  // 处理前端发送的 status 字段
  const published = status === 'published' || (isPublished ? 1 : 0);

  // 如果摘要为空，从正文中提取一小段文字作为摘要
  let finalSummary = summary;
  if (!finalSummary) {
    // 移除 HTML 标签，提取纯文本
    const plainText = content.replace(/<[^>]*>/g, '');
    // 截取前 150 个字符作为摘要
    finalSummary = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
  }

  // 更新文章
  db.run(
    `UPDATE articles
     SET title = ?, content = ?, summary = ?, cover_image = ?, category_id = ?,
         is_published = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      title,
      content,
      finalSummary,
      coverImage || null,
      categoryId || null,
      published ? 1 : 0,
      isFeatured ? 1 : 0,
      id
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // 更新标签
      if (tags !== undefined) {
        // 先删除旧标签关联
        db.run('DELETE FROM article_tags WHERE article_id = ?', [id]);

        // 添加新标签
        if (tags.length > 0) {
          tags.forEach(tagName => {
            // 查找或创建标签
            db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, tag) => {
              if (err) {
                console.error('Error finding tag:', err.message);
                return;
              }

              if (tag) {
                // 标签存在，直接关联
                db.run('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [id, tag.id]);
              } else {
                // 标签不存在，创建新标签
                db.run(
                  'INSERT INTO tags (name, slug) VALUES (?, ?)',
                  [tagName, tagName.toLowerCase().replace(/\s+/g, '-')],
                  function(err) {
                    if (err) {
                      console.error('Error creating tag:', err.message);
                      return;
                    }
                    db.run('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [id, this.lastID]);
                  }
                );
              }
            });
          });
        }
      }

      res.json({ message: 'Article updated successfully' });
    }
  );
});

// 删除文章（需要权限验证）
router.delete('/:id', validateAuth, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  });
});

// 搜索文章
router.get('/search', (req, res) => {
  const { query, limit = 20 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query required' });
  }

  // 简单的模糊搜索
  db.all(
    `SELECT a.*, s.views, c.name as category_name
     FROM articles a
     LEFT JOIN article_stats s ON a.id = s.article_id
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.is_published = 1 AND (a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)
     ORDER BY a.published_at DESC
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, `%${query}%`, limit],
    (err, articles) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 获取每个文章的标签
      const articlesWithTags = articles.map(article => {
        return new Promise((resolve, reject) => {
          db.all(
            `SELECT t.* FROM tags t
             JOIN article_tags at ON t.id = at.tag_id
             WHERE at.article_id = ?`,
            [article.id],
            (err, tags) => {
              if (err) {
                reject(err);
              } else {
                resolve({ ...article, tags });
              }
            }
          );
        });
      });

      Promise.all(articlesWithTags)
        .then(result => {
          res.json(result);
        })
        .catch(err => {
          res.status(500).json({ error: err.message });
        });
    }
  );
});

module.exports = router;