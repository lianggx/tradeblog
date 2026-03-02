const { db } = require('../db');

class TagRepository {
  create(data) {
    const stmt = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)');
    const result = stmt.run(data.name, data.slug);
    return this.findById(result.lastInsertRowid);
  }

  update(id, data) {
    const stmt = db.prepare('UPDATE tags SET name = ?, slug = ? WHERE id = ?');
    stmt.run(data.name, data.slug, id);
    return this.findById(id);
  }

  delete(id) {
    db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    return true;
  }

  findById(id) {
    return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  }

  findAll() {
    return db.prepare('SELECT * FROM tags ORDER BY name').all();
  }

  findBySlug(slug) {
    return db.prepare('SELECT * FROM tags WHERE slug = ?').get(slug);
  }

  getWithArticleCount() {
    return db.prepare(`
      SELECT t.*, COUNT(a.id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      LEFT JOIN articles a ON at.article_id = a.id AND a.is_published = 1
      GROUP BY t.id
      ORDER BY t.name
    `).all();
  }
}

module.exports = new TagRepository();
