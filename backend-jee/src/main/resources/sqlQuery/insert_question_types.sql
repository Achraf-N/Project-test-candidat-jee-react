-- Migration script to insert question types
-- Run this script to populate the questiontypes table with the three standard question types
-- Created: 2026-01-21

-- Insert the three question types that correspond to the QuestionType enum
INSERT INTO questiontypes (id, type) VALUES
    (1, 'qcm'),
    (2, 'true or false'),
    (3, 'open question')
ON CONFLICT (type) DO NOTHING;

-- Update the sequence to the next available value after the inserts
SELECT setval('questiontypes_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM questiontypes), false);

-- Verification query - Check inserted data
SELECT id, type FROM questiontypes ORDER BY id;

