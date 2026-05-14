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
    
    // Find Strapi tables related to files
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%file%';
    `);
    console.log('File tables:', res.rows.map(r => r.table_name));

    // If 'files' table exists
    if (res.rows.find(r => r.table_name === 'files')) {
      const filesRes = await client.query('SELECT id, name, url, ext FROM files');
      console.log('Files in DB:', filesRes.rows);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
