const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://strapi:Strapi54007!@127.0.0.1:5432/strapi'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to Database');

    const actions = ['api::tag.tag.find', 'api::tag.tag.findOne'];
    const roles = [5, 6]; // 5 = Authenticated, 6 = Public

    for (const action of actions) {
      // Insert permission if not exists
      const checkPerm = await client.query('SELECT id FROM up_permissions WHERE action = $1 LIMIT 1;', [action]);
      let permissionId;
      if (checkPerm.rows.length === 0) {
        const docId = 'tag' + Math.random().toString(36).substring(2, 22);
        const insPerm = await client.query(
          'INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at) VALUES ($1, $2, NOW(), NOW(), NOW()) RETURNING id;',
          [docId, action]
        );
        permissionId = insPerm.rows[0].id;
        console.log(`Inserted permission ${action} (ID: ${permissionId})`);
      } else {
        permissionId = checkPerm.rows[0].id;
        console.log(`Permission ${action} already exists (ID: ${permissionId})`);
      }

      // Link to roles
      for (const roleId of roles) {
        const checkLink = await client.query(
          'SELECT id FROM up_permissions_role_lnk WHERE permission_id = $1 AND role_id = $2 LIMIT 1;',
          [permissionId, roleId]
        );
        if (checkLink.rows.length === 0) {
          await client.query(
            'INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES ($1, $2);',
            [permissionId, roleId]
          );
          console.log(`Linked permission ${action} to role ${roleId}`);
        } else {
          console.log(`Link already exists for permission ${action} and role ${roleId}`);
        }
      }
    }
  } catch (e) {
    console.error('Error granting permissions:', e.message);
  } finally {
    await client.end();
  }
}

run();
