import persist from '../src/index';
let id = parseInt(10000 * Math.random());
const connection = persist.createConnection({
  name: 'test',
  version: '1.0.0'
});

connection.define('user', {
  "id": "integer primary key autoincrement",
  "user_mail": "varchar(255)",
  "user_age": "integer"
});

connection.connect().catch(err => {
  console.error(err);
}).then(() => {
  return connection.insert(`user`, {
    user_mail: 'sdfsdaf',
    user_age: id
  });
}).then(data => {
  const id = data.insertId;
  if (id) {
    // return connection.update('user', {user_age : 99999},'id=?', [id]);
    return connection.delete('user', 'id=?', [id]);
  }
}).then(() => {
  return connection.exec(`select * from user`);
}).then(data => {
  console.log(data.rows.length);
})