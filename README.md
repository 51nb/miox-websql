# Miox WebSQL

```bash
npm install --save miox-websql
```

# Usage

```javascript
import persist from 'miox-websql';
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
```

## Use in miox

创建连接 `connnection.js`

```javascript
import persist from 'miox-websql';
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

export default connection;
```

创建中间件 `middleware.js`

```javascript
import connection from './connnection';
export default function MioxWebSQLMiddleware(ctx, next) {
  if (ctx.websql) {
    return await next();
  }

  await connection.connect();
  ctx.websql = connection;
  await next();
}
```

使用中间件

```javascript
import MioxWebSQLMiddleware from './middleware';
router.use(MioxWebSQLMiddleware, async (ctx, next) => {
  ctx.user = (await ctx.websql.exec(`select * from user`)).rows;
  await next();
});
router.patch('/user', async ctx => {
  await ctx.render(webview, {
    user: ctx.user
  })
});
```

或者我们用param处理 url: `/user/12345`

```javascript
import MioxWebSQLMiddleware from './middleware';

router.use(MioxWebSQLMiddleware);
router.param('user', async (id, ctx, next) => {
  ctx.user = (await ctx.websql.exec(`select * from user where id=?`, [id])).rows[0];
  await next();
});
router.patch('/user/:user', async ctx => {
  await ctx.render(webview, {
    user: ctx.user
  })
});
```
