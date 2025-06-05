-- Update application table column lengths to handle longer job data
-- This addresses varchar(255) constraint violations when parsing job postings

-- Increase company name length (for longer company names)
ALTER TABLE applications ALTER COLUMN company TYPE VARCHAR(500);

-- Increase job title length (for descriptive job titles)
ALTER TABLE applications ALTER COLUMN job_title TYPE VARCHAR(500);

-- Increase location length (for multiple concatenated locations)
ALTER TABLE applications ALTER COLUMN location TYPE VARCHAR(1000);

-- Increase URL length (for complex URLs with parameters)
ALTER TABLE applications ALTER COLUMN url TYPE VARCHAR(2000);

-- Increase compensation type length (for descriptive compensation types)
ALTER TABLE applications ALTER COLUMN compensation_type TYPE VARCHAR(100);

-- Increase experience level length (for descriptive experience levels)
ALTER TABLE applications ALTER COLUMN experience_level TYPE VARCHAR(100);

-- Increase status length (for descriptive status values)
ALTER TABLE applications ALTER COLUMN status TYPE VARCHAR(100); 