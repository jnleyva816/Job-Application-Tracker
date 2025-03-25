-- Development Database Cleanup Script
-- This script will clean up all tables in the development database
-- WARNING: This script will delete all data. Use only in development!

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clean up tables in reverse order of dependencies
DELETE FROM contacts;
DELETE FROM applications;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE contacts_contact_id_seq RESTART WITH 1;
ALTER SEQUENCE applications_application_id_seq RESTART WITH 1;
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Log cleanup completion
DO $$
BEGIN
    RAISE NOTICE 'Development database cleanup completed successfully';
END $$; 