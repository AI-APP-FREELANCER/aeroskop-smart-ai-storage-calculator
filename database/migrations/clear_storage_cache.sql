-- Clear storage recommendations cache table
-- This script removes all cached recommendations to start fresh
-- Execute this when cache contains incorrect information

TRUNCATE TABLE storage_recommendations_cache;

-- Optional: Reset sequence if using auto-increment IDs
-- ALTER SEQUENCE storage_recommendations_cache_id_seq RESTART WITH 1;

-- Verify the table is empty
SELECT COUNT(*) as remaining_records FROM storage_recommendations_cache;

