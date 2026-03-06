// SQLite3 到 better-sqlite3 的适配器
const Database = require('better-sqlite3');

class Sqlite3Adapter {
  constructor(db) {
    this.db = db;
  }

  // 模拟 sqlite3 的 run 方法
  run(sql, params, callback) {
    try {
      // 处理参数：run(sql, [params], callback)
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...(params || []));
      if (callback) {
        callback.call({ lastID: result.lastInsertRowid, changes: result.changes }, null);
      }
      return result;
    } catch (err) {
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }

  // 模拟 sqlite3 的 get 方法
  get(sql, params, callback) {
    try {
      // 处理参数：get(sql, [params], callback)
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const stmt = this.db.prepare(sql);
      const row = stmt.get(...(params || []));
      if (callback) {
        callback(null, row);
      }
      return row;
    } catch (err) {
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }

  // 模拟 sqlite3 的 all 方法
  all(sql, params, callback) {
    try {
      // 处理参数：all(sql, [params], callback)
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...(params || []));
      if (callback) {
        callback(null, rows);
      }
      return rows;
    } catch (err) {
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }
}

module.exports = Sqlite3Adapter;
