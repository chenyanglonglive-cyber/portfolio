const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Delete from join tables first
    await client.query('DELETE FROM files_related_mph WHERE file_id IN (4, 5, 6, 7)');
    console.log('Deleted from files_related_mph');
    
    await client.query('DELETE FROM files_folder_lnk WHERE file_id IN (4, 5, 6, 7)');
    console.log('Deleted from files_folder_lnk');

    // Delete from files
    const res = await client.query('DELETE FROM files WHERE id IN (4, 5, 6, 7)');
    console.log(`Deleted ${res.rowCount} rows from files`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
