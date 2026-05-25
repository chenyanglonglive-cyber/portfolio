const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://strapi:Strapi54007!@127.0.0.1:5432/strapi'
  });

  try {
    await client.connect();
    console.log('Connected to database on ECS.');

    // 1. List all tables
    try {
      const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';");
      console.log('\n--- All Public Tables ---');
      console.log(JSON.stringify(tablesRes.rows.map(r => r.table_name), null, 2));
    } catch (e) {
      console.error('Error listing tables:', e.message);
    }

    // 2. Query videos
    try {
      const videosRes = await client.query('SELECT id, title, published_at, created_at FROM videos ORDER BY id DESC;');
      console.log('\n--- Videos in DB ---');
      console.log(JSON.stringify(videosRes.rows, null, 2));
    } catch (e) {
      console.error('Error querying videos:', e.message);
    }

    // 2b. Query folders
    try {
      const foldersRes = await client.query('SELECT id, name, path FROM upload_folders;');
      console.log('\n--- Folders in DB ---');
      console.log(JSON.stringify(foldersRes.rows, null, 2));
    } catch (e) {
      console.error('Error querying folders:', e.message);
    }

    // 2c. Query folder-file links
    try {
      const linksRes = await client.query('SELECT * FROM files_folder_lnk WHERE file_id IN (45, 46, 47, 48);');
      console.log('\n--- File-Folder Links for Recent Files ---');
      console.log(JSON.stringify(linksRes.rows, null, 2));
    } catch (e) {
      console.error('Error querying links:', e.message);
    }

    // 3. Query recently uploaded files
    try {
      const allFilesRes = await client.query('SELECT id, name, url, mime, size, created_at FROM files ORDER BY id DESC LIMIT 20;');
      console.log('\n--- Recently Uploaded Files in Media Library ---');
      console.log(JSON.stringify(allFilesRes.rows, null, 2));
    } catch (e) {
      console.error('Error querying files:', e.message);
    }

  } catch (err) {
    console.error('Error running database queries:', err);
  } finally {
    await client.end();
  }
}

main();
