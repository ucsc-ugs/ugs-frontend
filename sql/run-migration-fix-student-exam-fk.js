/**
 * run-migration-fix-student-exam-fk.js
 * - Simple Node script to run the SQL migration file against Postgres.
 * - Requires environment variables: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
 * - Usage: node run-migration-fix-student-exam-fk.js
 */

const fs = require('fs');
const { Client } = require('pg');
const path = require('path');

const migrationPath = path.join(__dirname, '2025-10-18-fix-student-exam-fk.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

async function run() {
  const client = new Client();
  try {
    await client.connect();
    console.log('Connected to Postgres. Running migration...');

    // Show counts before
    const before = await client.query(`
      SELECT
        (SELECT count(*) FROM users) AS users_count,
        (SELECT count(*) FROM students) AS students_count,
        (SELECT count(*) FROM student_exam) AS student_exam_count
    `);
    console.log('Before:', before.rows[0]);

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration executed successfully.');

    // Show counts after
    const after = await client.query(`
      SELECT
        (SELECT count(*) FROM users) AS users_count,
        (SELECT count(*) FROM students) AS students_count,
        (SELECT count(*) FROM student_exam) AS student_exam_count,
        (SELECT count(*) FROM student_exam se LEFT JOIN students s ON s.id = se.student_id WHERE s.id IS NULL) AS orphan_student_exam_count
    `);
    console.log('After:', after.rows[0]);

    // Show some sample joined rows
    const sample = await client.query(`
      SELECT se.id AS se_id, se.student_id AS se_student_id, s.id AS student_id, s.user_id AS student_user_id, u.id AS user_id, u.email
      FROM student_exam se
      LEFT JOIN students s ON s.id = se.student_id
      LEFT JOIN users u ON u.id = s.user_id
      LIMIT 20
    `);
    console.log('Sample mappings (first 20):');
    console.table(sample.rows);

  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.query('ROLLBACK'); } catch (e) {}
  } finally {
    await client.end();
  }
}

run().catch(err => console.error(err));
