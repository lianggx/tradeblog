const { db } = require('../db');

class ApiKeyRepository {
  create(data) {
    const stmt = db.prepare('INSERT INTO api_keys (name, key) VALUES (?, ?)');
    const result = stmt.run(data.name, data.key);
    return this.findById(result.lastInsertRowid);
  }

  update(id, data) {
    const stmt = db.prepare('UPDATE api_keys SET name = ?, is_active = ? WHERE id = ?');
    stmt.run(data.name, data.isActive ? 1 : 0, id);
    return this.findById(id);
  }

  delete(id) {
    db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);
    return true;
  }

  findById(id) {
    return db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
  }

  findAll() {
    return db.prepare('SELECT * FROM api_keys ORDER BY created_at DESC').all();
  }

  findByKey(key) {
    return db.prepare('SELECT * FROM api_keys WHERE key = ? AND is_active = 1').get(key);
  }

  updateLastUsed(id) {
    db.prepare('UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }

  generateKey() {
    return `tk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

module.exports = new ApiKeyRepository();
