Migration: Fix student_exam.student_id FK

Purpose

This migration updates `student_exam.student_id` values which were incorrectly set to `users.id` to the proper `students.id`. It also adds a `students.user_id` mapping column and updates foreign keys accordingly.

Files

- `2025-10-18-fix-student-exam-fk.sql` - The SQL migration file (Postgres).
- `run-migration-fix-student-exam-fk.js` - Node script to execute the migration and print before/after summaries.

Pre-reqs

- PostgreSQL database.
- Backup your database before running any migration.
- Set environment variables: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.
- Node.js installed for the runner script.

How to run (safe suggested flow)

1. Backup your DB:

```bash
pg_dump -U $PGUSER -h $PGHOST -Fc $PGDATABASE > backup_$(date +%F).dump
```

2. Inspect current mappings manually (optional but recommended):

```sql
-- run in psql
SELECT se.* FROM student_exam se LEFT JOIN students s ON s.user_id = se.student_id WHERE s.id IS NULL LIMIT 50;
SELECT * FROM students WHERE user_id IS NULL LIMIT 50;
```

3. Run the Node runner (it executes the SQL inside a transaction):

```bash
# from repository root
node sql/run-migration-fix-student-exam-fk.js
```

4. Review output. The script prints counts before/after and a sample of mappings.

Notes

- The SQL assumes you can map users -> students by `email`. If you need to match by a different field (e.g., `passport_nic`), edit `2025-10-18-fix-student-exam-fk.sql` accordingly before running.
- The script will not automatically create student rows (that block is commented out). If you want the script to create missing students, edit the SQL to uncomment the INSERT block.
- Test on staging first.

If you want, I can:
- Update the SQL to match `passport_nic` instead of email.
- Enable automatic creation of student rows for unmapped users (but we should discuss required student column defaults first).
- Run the migration here if you provide DB connection details (not recommended to share credentials in chat).
