const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取博客统计信息
router.get('/', (req, res) => {
  const stats = {
    totalArticles: 0,
    totalViews: 0,
    popularArticles: []
  };

  // 获取总文章数
  db.get('SELECT COUNT(*) as count FROM articles WHERE is_published = 1', (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    stats.totalArticles = result.count;

    // 获取总访问量
    db.get('SELECT SUM(views) as total FROM article_stats', (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      stats.totalViews = result.total || 0;

      // 获取热门文章
      db.all(
        `SELECT a.id, a.title, a.published_at, s.views
         FROM articles a
         JOIN article_stats s ON a.id = s.article_id
         WHERE a.is_published = 1
         ORDER BY s.views DESC
         LIMIT 10`,
        (err, articles) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          stats.popularArticles = articles;

          res.json(stats);
        }
      );
    });
  });
});

module.exports = router;
