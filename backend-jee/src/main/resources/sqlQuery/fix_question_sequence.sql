-- Fix question sequence to prevent duplicate key violations
-- This script resets the sequence to the correct value

-- Step 1: Find the current maximum ID in the question table
SELECT MAX(id) FROM question;

-- Step 2: Reset the sequence to the correct value
-- Replace <max_id> with the result from step 1, then add 1
-- Example: If MAX(id) is 152, use 153

SELECT setval('question_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM question), false);

-- Step 3: Verify the sequence value
SELECT currval('question_seq');

-- Alternative: If you want to reset it manually to a specific value (e.g., 200)
-- SELECT setval('question_seq', 200, false);

