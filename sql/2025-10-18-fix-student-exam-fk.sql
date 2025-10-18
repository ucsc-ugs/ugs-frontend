-- 2025-10-18-fix-student-exam-fk.sql
-- Purpose: Fix student_exam.student_id values that currently reference users.id
-- and make them reference students.id instead. Also add students.user_id mapping
-- and adjust foreign keys accordingly.
-- WARNING: BACKUP your database before running this migration.
-- Tested for Postgres. Adjust identifiers to match your schema if different.

-- Configuration: replace matching condition in the population step if you
-- need to match by a different column (e.g., passport_nic or nic).

BEGIN;

-- 1) Add students.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='students' AND column_name='user_id'
    ) THEN
        ALTER TABLE students ADD COLUMN user_id INTEGER;
    END IF;
END$$;

-- 2) Populate students.user_id by matching users.email = students.email
-- Change the WHERE clause if you match on a different column.
-- This will only update rows where a matching user exists.
UPDATE students s
SET user_id = u.id
FROM users u
WHERE u.email IS NOT NULL
  AND u.email = s.email
  AND (s.user_id IS NULL OR s.user_id <> u.id);

-- 3) OPTIONAL: create missing student rows for users that do not yet have students
-- If you prefer to inspect and create these manually, skip this block.
-- The example below will create minimal student rows for users without a student.
-- Comment this out if you do not want automatic student creation.

-- INSERT INTO students (user_id, local, passport_nic, created_at)
-- SELECT u.id, true, u.passport_nic, now()
-- FROM users u
-- LEFT JOIN students s ON s.user_id = u.id
-- WHERE s.id IS NULL;

-- 4) Find orphan student_exam rows (those that reference users.id but have no mapped student)
-- (This query is informative; you can run it before applying the migration.)
-- SELECT se.* FROM student_exam se LEFT JOIN students s ON s.user_id = se.student_id WHERE s.id IS NULL LIMIT 100;

-- 5) Update student_exam.student_id to use students.id instead of users.id
-- This assumes se.student_id currently contains users.id values.
UPDATE student_exam se
SET student_id = s.id
FROM students s
WHERE s.user_id = se.student_id
  AND s.id IS NOT NULL
  AND se.student_id IS NOT NULL
  AND se.student_id <> s.id;

-- 6) Verify there are no remaining student_exam rows that point to non-student ids
-- You can run this SELECT manually before committing.
-- SELECT count(*) FROM student_exam se LEFT JOIN students s ON s.id = se.student_id WHERE s.id IS NULL;

-- 7) Replace foreign key constraint on student_exam.student_id to reference students(id)
-- First, try to discover and drop existing FK if it references users(id).

-- Find existing FK constraint name for student_exam.student_id
DO $$
DECLARE
    fk_name text;
BEGIN
    SELECT tc.constraint_name INTO fk_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.constraint_schema = kcu.constraint_schema
    WHERE tc.table_name = 'student_exam'
      AND kcu.column_name = 'student_id'
      AND tc.constraint_type = 'FOREIGN KEY'
    LIMIT 1;

    IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE student_exam DROP CONSTRAINT IF EXISTS %I', fk_name);
    END IF;
END$$;

-- Add new FK to students(id)
ALTER TABLE student_exam
  ADD CONSTRAINT student_exam_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

-- 8) (Optional) Add unique constraint and FK students.user_id -> users.id
-- to enforce one-to-one mapping between users and students.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'students' AND constraint_name = 'students_user_id_unique'
    ) THEN
        -- Add unique constraint if not present
        BEGIN
            ALTER TABLE students ADD CONSTRAINT students_user_id_unique UNIQUE (user_id);
        EXCEPTION WHEN duplicate_object THEN
            -- ignore
            NULL;
        END;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'students' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'user_id'
    ) THEN
        BEGIN
            ALTER TABLE students ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END$$;

COMMIT;

-- End of migration

-- Usage notes:
-- 1) Run this in a transaction-aware tool (psql) or as a migration in your framework.
-- 2) Inspect the pre-update SELECT queries to confirm mappings before running the UPDATE.
-- 3) If you have custom column names, edit the script accordingly.
