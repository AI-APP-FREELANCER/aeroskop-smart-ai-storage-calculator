-- ============================================================================
-- Verification Script for DigitalOcean PostgreSQL Setup
-- ============================================================================
-- Run this script after running digitalocean-setup.sql to verify all tables
-- and indexes were created successfully.
-- ============================================================================

-- 1. List all tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Count total tables (should be 16)
SELECT COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- 3. List all indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. Count indexes per table
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 5. Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 6. Verify UUID extension is enabled
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 7. Check table row counts (should all be 0 for new database)
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 8. Expected tables checklist
-- Uncomment to see which tables exist vs expected

-- Expected tables:
-- 1. users
-- 2. sessions
-- 3. ai_recommendations
-- 4. storage_recommendations_cache
-- 5. user_activities
-- 6. page_analytics
-- 7. click_streams
-- 8. ai_usage_logs
-- 9. analytics_summary
-- 10. chat_messages
-- 11. calculation_contexts
-- 12. gemini_usage
-- 13. user_analytics
-- 14. calculator_interactions
-- 15. recommendation_analytics
-- 16. consultation_enquiry

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN '✅'
        ELSE '❌'
    END as users,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN '✅'
        ELSE '❌'
    END as sessions,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_recommendations') THEN '✅'
        ELSE '❌'
    END as ai_recommendations,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storage_recommendations_cache') THEN '✅'
        ELSE '❌'
    END as storage_recommendations_cache,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_activities') THEN '✅'
        ELSE '❌'
    END as user_activities,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_analytics') THEN '✅'
        ELSE '❌'
    END as page_analytics,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'click_streams') THEN '✅'
        ELSE '❌'
    END as click_streams,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_usage_logs') THEN '✅'
        ELSE '❌'
    END as ai_usage_logs,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_summary') THEN '✅'
        ELSE '❌'
    END as analytics_summary,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN '✅'
        ELSE '❌'
    END as chat_messages,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculation_contexts') THEN '✅'
        ELSE '❌'
    END as calculation_contexts,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gemini_usage') THEN '✅'
        ELSE '❌'
    END as gemini_usage,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_analytics') THEN '✅'
        ELSE '❌'
    END as user_analytics,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculator_interactions') THEN '✅'
        ELSE '❌'
    END as calculator_interactions,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recommendation_analytics') THEN '✅'
        ELSE '❌'
    END as recommendation_analytics,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultation_enquiry') THEN '✅'
        ELSE '❌'
    END as consultation_enquiry;

