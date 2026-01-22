-- Migration script to insert domains
-- Run this script to populate the domain table with common industry domains
-- Created: 2026-01-21

-- Insert common domains for different industries
INSERT INTO domain (id, name) VALUES
    (nextval('domain_seq'), 'Technology'),
    (nextval('domain_seq'), 'Artificial Intelligence'),
    (nextval('domain_seq'), 'Software Development'),
    (nextval('domain_seq'), 'Data Science'),
    (nextval('domain_seq'), 'Cloud Computing'),
    (nextval('domain_seq'), 'Cybersecurity'),
    (nextval('domain_seq'), 'Finance'),
    (nextval('domain_seq'), 'Healthcare'),
    (nextval('domain_seq'), 'Education'),
    (nextval('domain_seq'), 'Manufacturing'),
    (nextval('domain_seq'), 'Retail'),
    (nextval('domain_seq'), 'Telecommunications'),
    (nextval('domain_seq'), 'Energy'),
    (nextval('domain_seq'), 'Transportation'),
    (nextval('domain_seq'), 'Entertainment'),
    (nextval('domain_seq'), 'Consulting'),
    (nextval('domain_seq'), 'Research & Development'),
    (nextval('domain_seq'), 'Marketing & Advertising'),
    (nextval('domain_seq'), 'Human Resources')
ON CONFLICT (name) DO NOTHING;

-- Update the sequence to the next available value
SELECT setval('domain_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM domain), false);

-- Verification query - Check inserted data
SELECT id, name FROM domain ORDER BY name;

-- Count total domains
SELECT COUNT(*) as total_domains FROM domain;

