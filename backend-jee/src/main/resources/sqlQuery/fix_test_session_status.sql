-- Migration script to fix test_session status values
-- This updates old status values to match the new enum

-- Update IN_PROGRESS to ACTIVE
UPDATE test_session
SET status = 'ACTIVE'
WHERE status = 'IN_PROGRESS';

-- Update COMPLETED to FINISHED
UPDATE test_session
SET status = 'FINISHED'
WHERE status = 'COMPLETED';

-- Update any other old values
UPDATE test_session
SET status = 'PLANNED'
WHERE status = 'PLANNING';

-- Verify the update
SELECT status, COUNT(*) as count
FROM test_session
GROUP BY status;

