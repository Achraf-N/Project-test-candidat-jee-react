-- Insert Question Types with specific IDs
INSERT INTO questiontypes (id, type) VALUES
                                         (1, 'qcm'),
                                         (2, 'true or false'),
                                         (3, 'open question')
    ON CONFLICT (type) DO NOTHING;

-- Update the sequence to the next available value
SELECT setval('questiontypes_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM questiontypes), false);

-- Verify the insert
SELECT * FROM questiontypes ORDER BY id;
