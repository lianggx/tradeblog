const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'database.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDatabase();
  }
});

// 初始化数据库表
function initDatabase() {
  // 创建文章表
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      cover_image TEXT,
      category_id INTEGER,
      is_published INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建分类表
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL
    )
  `);

  // 创建标签表
  db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL
    )
  `);

  // 创建文章标签关联表
  db.run(`
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // 创建文章统计信息表
  db.run(`
    CREATE TABLE IF NOT EXISTS article_stats (
      article_id INTEGER PRIMARY KEY,
      views INTEGER DEFAULT 0,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )
  `);

  // 创建 API 密钥表
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 插入示例数据
  insertDemoData();
}

// 插入示例数据
function insertDemoData() {
  // 只在开发环境中插入示例数据
  if (process.env.NODE_ENV !== 'production') {
    // 检查是否已有数据
    db.get('SELECT COUNT(*) as count FROM categories', (err, result) => {
      if (err) {
        console.error('Error checking categories:', err.message);
        return;
      }

      if (result.count === 0) {
        // 插入分类
        const categories = ['技术', '生活'];
        categories.forEach((name, index) => {
          db.run(
            'INSERT INTO categories (name, slug) VALUES (?, ?)',
            [name, name.toLowerCase().replace(/\s+/g, '-')]
          );
        });
      }
    });

    // 检查标签
    db.get('SELECT COUNT(*) as count FROM tags', (err, result) => {
      if (err) {
        console.error('Error checking tags:', err.message);
        return;
      }

      if (result.count === 0) {
        // 插入标签
        const tags = ['JavaScript', 'Vue', 'Node.js', 'SQLite', '前端'];
        tags.forEach((name, index) => {
          db.run(
            'INSERT INTO tags (name, slug) VALUES (?, ?)',
            [name, name.toLowerCase().replace(/\s+/g, '-')]
          );
        });
      }
    });

    // 检查文章
    db.get('SELECT COUNT(*) as count FROM articles', (err, result) => {
      if (err) {
        console.error('Error checking articles:', err.message);
        return;
      }

      if (result.count === 0) {
        // 插入示例文章
        const articles = [
          {
            title: 'Vue 3 新特性介绍',
            content: '<h1>Vue 3 新特性</h1><p>Vue 3 带来了许多令人兴奋的新特性，包括 Composition API、Teleport、Suspense 等。</p>',
            summary: 'Vue 3 新特性详细介绍',
            category_id: 1,
            is_published: 1,
            is_featured: 1
          },
          {
            title: 'Node.js 性能优化技巧',
            content: '<h1>Node.js 性能优化</h1><p>本文介绍了一些 Node.js 应用的性能优化技巧，帮助你构建更高效的后端服务。</p>',
            summary: 'Node.js 性能优化的实用技巧',
            category_id: 1,
            is_published: 1
          },
          {
            title: '生活随笔：程序员的日常',
            content: '<h1>程序员的日常</h1><p>记录一下作为程序员的日常生活和工作感悟。</p>',
            summary: '程序员的日常生活记录',
            category_id: 2,
            is_published: 1
          }
        ];

        articles.forEach((article, index) => {
          db.run(
            `INSERT INTO articles (title, content, summary, category_id, is_published, is_featured, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              article.title,
              article.content,
              article.summary,
              article.category_id,
              article.is_published,
              article.is_featured,
              new Date().toISOString()
            ],
            function(err) {
              if (err) {
                console.error('Error inserting article:', err.message);
                return;
              }

              // 为文章创建统计信息
              db.run(
                'INSERT INTO article_stats (article_id) VALUES (?)',
                [this.lastID]
              );

              // 为文章添加标签
              const tagIds = [1, 2, 3]; // 示例标签 ID
              tagIds.forEach(tagId => {
                db.run(
                  'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
                  [this.lastID, tagId]
                );
              });
            }
          );
        });
      }
    });

    // 检查 API 密钥
    db.get('SELECT COUNT(*) as count FROM api_keys', (err, result) => {
      if (err) {
        console.error('Error checking API keys:', err.message);
        return;
      }

      if (result.count === 0) {
        // 插入默认 API 密钥
        db.run(
          'INSERT INTO api_keys (key, description) VALUES (?, ?)',
          ['demo-api-key-123', '默认 API 密钥']
        );
      }
    });
  }
}

module.exports = db;
