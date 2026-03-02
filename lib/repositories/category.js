const { db } = require('../db');

class CategoryRepository {
  create(data) {
    const stmt = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)');
    const result = stmt.run(data.name, data.slug, data.description || '');
    return this.findById(result.lastInsertRowid);
  }

  update(id, data) {
    const stmt = db.prepare('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?');
    stmt.run(data.name, data.slug, data.description || '', id);
    return this.findById(id);
  }

  delete(id) {
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return true;
  }

  findById(id) {
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  }

  findAll() {
    return db.prepare('SELECT * FROM categories ORDER BY name').all();
  }

  findBySlug(slug) {
    return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
  }

  getWithArticleCount() {
    return db.prepare(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.is_published = 1
      GROUP BY c.id
      ORDER BY c.name
    `).all();
  }
}

module.exports = new CategoryRepository();
