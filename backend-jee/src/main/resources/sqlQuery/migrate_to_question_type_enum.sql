-- Migration script to convert QuestionTypes table to enum in Question table
-- This updates the Question table to use an enum instead of a foreign key

-- Step 1: Add the new column for question type enum
ALTER TABLE question ADD COLUMN IF NOT EXISTS question_type VARCHAR(50);

-- Step 2: Migrate existing data from question_types_id to question_type
UPDATE question q
SET question_type = CASE
    WHEN qt.type = 'qcm' THEN 'QCM'
    WHEN qt.type = 'true or false' THEN 'TRUE_OR_FALSE'
    WHEN qt.type = 'open question' THEN 'OPEN_QUESTION'
    ELSE 'QCM'  -- Default fallback
END
FROM questiontypes qt
WHERE q.question_types_id = qt.id;

-- Step 3: Set question_type as NOT NULL (after data migration)
ALTER TABLE question ALTER COLUMN question_type SET NOT NULL;

-- Step 4: Drop the old foreign key constraint
ALTER TABLE question DROP CONSTRAINT IF EXISTS fk60ila166at6bxk75fl7ajb590;

-- Step 5: Drop the old question_types_id column
ALTER TABLE question DROP COLUMN IF EXISTS question_types_id;

-- Step 6: Optional - You can now drop the QuestionTypes table if no longer needed
-- DROP TABLE IF EXISTS questiontypes CASCADE;

-- Verification queries:
-- Check the data migration
SELECT id, label, question_type FROM question LIMIT 10;

-- Check question type distribution
SELECT question_type, COUNT(*) as count FROM question GROUP BY question_type;

