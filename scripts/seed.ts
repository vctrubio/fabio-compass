const { Pool, QueryResult } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedFile = 'victor-class.sql';
const seedDir = path.join(__dirname, '../seeds_cvs');
const filePath = path.join(seedDir, seedFile);

fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, sql: string) => {
  if (err) {
    console.error(`Error reading ${seedFile}:`, err);
    return;
  }

  pool.query(sql, (err: Error, res: typeof QueryResult) => {
    if (err) {
      console.error(`Error executing ${seedFile}:`, err);
    } else {
      console.log(`Successfully executed ${seedFile}`);
    }
    pool.end();
  });
});
