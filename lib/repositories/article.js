const { db } = require('./db');

class ArticleRepository {
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO articles (title, content, summary, cover_image, category_id, is_published, is_featured, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title,
      data.content,
      data.summary || '',
      data.coverImage || null,
      data.categoryId || null,
      data.isPublished ? 1 : 0,
      data.isFeatured ? 1 : 0,
      data.publishedAt || new Date().toISOString()
    );

    db.prepare('INSERT INTO article_stats (article_id) VALUES (?)').run(result.lastInsertId);

    if (data.tags && data.tags.length > 0) {
      this.syncTags(result.lastInsertId, data.tags);
    }

    this.updateSearchIndex(result.lastInsertId, data);

    return this.findById(result.lastInsertId);
  }

  update(id, data) {
    const stmt = db.prepare(`
      UPDATE articles
      SET title = ?, content = ?, summary = ?, cover_image = ?, category_id = ?,
          is_published = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(
      data.title,
      data.content,
      data.summary || '',
      data.coverImage || null,
      data.categoryId || null,
      data.isPublished ? 1 : 0,
      data.isFeatured ? 1 : 0,
      id
    );

    if (data.tags !== undefined) {
      this.syncTags(id, data.tags);
    }

    this.updateSearchIndex(id, data);

    return this.findById(id);
  }

  delete(id) {
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    return true;
  }

  findById(id) {
    const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
    if (!article) return null;

    const tags = db.prepare(`
      SELECT t.* FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `).all(id);

    const stats = db.prepare('SELECT * FROM article_stats WHERE article_id = ?').get(id);

    return { ...article, tags, stats };
  }

  findAll(options = {}) {
    const { page = 1, limit = 10, categoryId, tagId, publishedOnly = true } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, s.views, c.name as category_name
      FROM articles a
      LEFT JOIN article_stats s ON a.id = s.article_id
      LEFT JOIN categories c ON a.category_id = c.id
    `;

    const params = [];
    const conditions = [];

    if (publishedOnly) {
      conditions.push('a.is_published = 1');
    }

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

    const articles = db.prepare(query).all(...params);

    return articles.map(article => ({
      ...article,
      is_published: !!article.is_published,
      is_featured: !!article.is_featured,
    }));
  }

  search(query, options = {}) {
    const { limit = 20 } = options;

    const results = db.prepare(`
      SELECT a.*, s.views, bm25(articles_fts) as relevance
      FROM articles_fts
      JOIN articles a ON articles_fts.rowid = a.id
      LEFT JOIN article_stats s ON a.id = s.article_id
      WHERE articles_fts MATCH ? AND a.is_published = 1
      ORDER BY relevance
      LIMIT ?
    `).all(query, limit);

    return results.map(article => ({
      ...article,
      is_published: !!article.is_published,
      is_featured: !!article.is_featured,
    }));
  }

  incrementViews(id) {
    db.prepare(`
      UPDATE article_stats
      SET views = views + 1
      WHERE article_id = ?
    `).run(id);
  }

  syncTags(articleId, tagNames) {
    db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);

    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');
      db.prepare('INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)').run(tagName, slug);
      const tag = db.prepare('SELECT id FROM tags WHERE slug = ?').get(slug);
      db.prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(articleId, tag.id);
    }
  }

  updateSearchIndex(id, data) {
    db.prepare(`
      INSERT OR REPLACE INTO articles_fts (rowid, title, summary, content)
      VALUES (?, ?, ?, ?)
    `).run(id, data.title, data.summary || '', data.content);
  }

  getStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM articles WHERE is_published = 1').get();
    const totalViews = db.prepare('SELECT SUM(views) as total FROM article_stats').get();
    const popular = db.prepare(`
      SELECT a.*, s.views
      FROM articles a
      JOIN article_stats s ON a.id = s.article_id
      WHERE a.is_published = 1
      ORDER BY s.views DESC
      LIMIT 10
    `).all();

    return {
      total: total.count,
      totalViews: total.total || 0,
      popular,
    };
  }
}

module.exports = new ArticleRepository();
