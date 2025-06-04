-- Fix Interviews Table Migration
-- Adds missing created_at and updated_at columns to the interviews table
-- 
-- This script should be run manually against the database to fix the schema mismatch
-- causing the "ERROR: column i1_0.created_at does not exist" error

BEGIN;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE interviews 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
        
        RAISE NOTICE 'Added created_at column to interviews table';
    ELSE
        RAISE NOTICE 'created_at column already exists in interviews table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE interviews 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
        
        -- Create trigger to automatically update the updated_at column
        CREATE OR REPLACE FUNCTION update_interviews_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER interviews_updated_at_trigger
            BEFORE UPDATE ON interviews
            FOR EACH ROW
            EXECUTE FUNCTION update_interviews_updated_at();
        
        RAISE NOTICE 'Added updated_at column and trigger to interviews table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in interviews table';
    END IF;
END $$;

-- Update existing records to have proper timestamps if they exist and are NULL
UPDATE interviews 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE interviews 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

COMMIT;

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE 'Migration completed. Verifying structure...';
    
    -- Check if both columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name = 'created_at'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name = 'updated_at'
    ) THEN
        RAISE NOTICE 'SUCCESS: Both created_at and updated_at columns are now present in interviews table';
    ELSE
        RAISE WARNING 'ERROR: One or both timestamp columns are still missing from interviews table';
    END IF;
END $$; 