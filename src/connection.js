import flatten from 'flatten';
export default class Connection {
  constructor(options) {
    this.db = global.openDatabase(options.name, options.version, options.desc, options.size);
    this.tables = {};
  }

  define(table, columns) {
    this.tables[table] = columns;
  }

  query(sql, args, callback) {
    if (typeof args === 'function') {
      callback = args;
      args = [];
    }
    if (!Array.isArray(args)) {
      args = [args];
    }
    this.db.transaction(transacte => {
      transacte.executeSql(sql, args, resolveCallback, rejectCallback);

      function resolveCallback(transacte, result) {
        callback(null, result, transacte);
      }

      function rejectCallback(transacte, err) {
        callback(err, transacte);
      }
    });
  }

  exec(sql, args = []) {
    return new Promise((resolve, reject) => {
      this.query(sql, args, (err, results, fields) => {
        if (err) return reject(err);
        resolve(results);
      })
    });
  }

  connect(callback) {
    const createPools = [];
    for (const table in this.tables) {
      const columns = [];
      for (const column in this.tables[table]) {
        columns.push(`${column} ${this.tables[table][column]}`);
      }
      createPools.push(this.exec(`CREATE TABLE IF NOT EXISTS ${table} (${columns.join(',')})`));
    }
    const connectPromise = Promise.all(createPools);
    if (typeof callback === 'function') {
      connectPromise.then(() => callback(null)).catch(err => callback(err));
    } else {
      return connectPromise;
    }
  }

  async insert(table, data) {
    let isSingle = false;
    const result = [];

    if (!Array.isArray(data)) {
      data = [data];
      isSingle = true;
    }

    for (let i = 0; i < data.length; i++) {
      const a = [],
        b = [],
        c = [];
      for (const col in data[i]) {
        a.push(col);
        b.push('?');
        c.push(data[i][col]);
      }
      result.push(await this.exec(`INSERT INTO ${table} (${a.join(',')}) VALUES (${b.join(',')})`, c));
    }

    if (isSingle) {
      return result[0];
    }

    return result;
  }

  async update(table, value, where, ...wheres) {
    let fields = [],
      values = [];
    for (let key in value) {
      fields.push(key + '=?');
      values.push(value[key]);
    }
    let sql = `UPDATE ${table} SET ${fields.join(',')}`;
    if (where) {
      sql += ' WHERE ' + where;
      wheres = flatten(wheres ? wheres : []);
      values = values.concat(wheres);
    }
    return await this.exec(sql, values);
  }

  async ['delete'](table, where, wheres) {
    let sql = `DELETE FROM ${table}`,
      values = [];
    if (where) {
      sql += ' WHERE ' + where;
      wheres = flatten(wheres ? wheres : []);
      values = values.concat(wheres);
    }
    return await this.exec(sql, values);
  }
}