const faunadb = require('faunadb');
const q = faunadb.query;

/* idempotent operation */
function setupSchema(serverKey) {
  console.log('Create the database classes and indexes');
  const client = new faunadb.Client({
    secret: serverKey
  });

  /* Based on your requirements, change the schema here */
  return client
    .query(
      q.CreateClass({
        name: 'users'
      })
    )
    .then(
      () =>
        console.log('==> 1. createusers success') ||
        client.query(
          q.Do(
            q.CreateClass({
              name: 'todos',
              permissions: {
                create: q.Class('users')
              }
            }),
            q.CreateClass({
              name: 'lists',
              permissions: {
                create: q.Class('users')
              }
            })
          )
        )
    )
    .then(
      () =>
        console.log('==> 2. create todos and lists success') ||
        client.query(
          q.Do(
            q.CreateIndex({
              name: 'users_by_id',
              source: q.Class('users'),
              terms: [
                {
                  field: ['data', 'id']
                }
              ],
              unique: true
            }),
            q.CreateIndex({
              // this index is optional but useful in development for browsing users
              name: `all_users`,
              source: q.Class('users')
            }),
            q.CreateIndex({
              name: 'all_todos',
              source: q.Class('todos'),
              permissions: {
                read: q.Class('users')
              }
            }),
            q.CreateIndex({
              name: 'all_lists',
              source: q.Class('lists'),
              permissions: {
                read: q.Class('users')
              }
            }),
            q.CreateIndex({
              name: 'todos_by_list',
              source: q.Class('todos'),
              terms: [
                {
                  field: ['data', 'list']
                }
              ],
              permissions: {
                read: q.Class('users')
              }
            })
          )
        )
    )
    .then(
      console.log('==> 3. create  eveyrthing success') ||
        console.log.bind(console)
    )
    .catch(e => {
      if (e.message === 'instance not unique') {
        console.log('schema already created... skipping');
      } else {
        console.error(e);
        throw e;
      }
    });
}

exports.setupSchema = setupSchema;
