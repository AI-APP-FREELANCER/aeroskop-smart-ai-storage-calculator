-- ============================================================================
-- Aeroskop Application - Complete Database Schema for DigitalOcean PostgreSQL
-- ============================================================================
-- Copy and paste this entire script into DBeaver SQL Editor and execute
-- ============================================================================

-- Enable UUID extension (required for UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES (No Dependencies)
-- ============================================================================

-- 1. Users table for registered users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Stores registered user information';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.country_code IS 'Country code (e.g., US, BH)';

-- 2. Sessions table for user sessions (depends on users)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'guest', -- 'user' or 'guest'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

COMMENT ON TABLE sessions IS 'Tracks user sessions (both registered users and guests)';
COMMENT ON COLUMN sessions.session_type IS 'Type of session: user or guest';

-- ============================================================================
-- AI & RECOMMENDATION TABLES
-- ============================================================================

-- 3. AI Recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Input parameters
    cameras INTEGER NOT NULL,
    resolution VARCHAR(20) NOT NULL,
    fps INTEGER NOT NULL,
    codec VARCHAR(10) NOT NULL,
    activity_level VARCHAR(20) NOT NULL,
    retention_days INTEGER NOT NULL,
    recording_mode VARCHAR(20) NOT NULL,
    
    -- Calculated results
    total_storage_tb DECIMAL(10,2) NOT NULL,
    daily_storage_tb DECIMAL(10,2) NOT NULL,
    total_bitrate_mbps DECIMAL(10,2) NOT NULL,
    estimated_cost DECIMAL(10,2) NOT NULL,
    standard_cost DECIMAL(10,2) NOT NULL,
    savings_amount DECIMAL(10,2) NOT NULL,
    
    -- AI Analysis
    ai_insights JSONB,
    optimization_suggestions JSONB,
    risk_assessment JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ai_recommendations IS 'Stores AI-generated storage recommendations';
COMMENT ON COLUMN ai_recommendations.total_storage_tb IS 'Total storage required in TB';
COMMENT ON COLUMN ai_recommendations.daily_storage_tb IS 'Daily storage per camera in TB';

-- 4. Storage Recommendations Cache table
CREATE TABLE IF NOT EXISTS storage_recommendations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_hash VARCHAR(64) UNIQUE NOT NULL,
  cameras INTEGER NOT NULL,
  resolution VARCHAR(20) NOT NULL,
  fps INTEGER NOT NULL,
  codec VARCHAR(10) NOT NULL,
  activity_level VARCHAR(20) NOT NULL,
  retention_days INTEGER NOT NULL,
  recording_mode VARCHAR(20) NOT NULL,
  
  -- AI Response Data
  recommended_product_good JSONB NOT NULL,
  recommended_product_better JSONB NOT NULL,
  recommended_product_best JSONB NOT NULL,
  storage_calculation JSONB NOT NULL,
  optimization_suggestions JSONB NOT NULL,
  cost_analysis JSONB,
  ai_insights TEXT,
  
  -- Metadata
  total_storage_tb NUMERIC(10,2),
  daily_storage_tb NUMERIC(10,2),
  estimated_cost NUMERIC(10,2),
  usage_count INTEGER DEFAULT 1,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE storage_recommendations_cache IS 'Cache table for AI-generated storage recommendations to avoid duplicate Gemini API calls';
COMMENT ON COLUMN storage_recommendations_cache.input_hash IS 'MD5 hash of input parameters for fast cache lookup';
COMMENT ON COLUMN storage_recommendations_cache.usage_count IS 'Number of times this cached recommendation has been accessed';

-- ============================================================================
-- ACTIVITY & ANALYTICS TABLES
-- ============================================================================

-- 5. User Activity Tracking
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'page_view', 'calculator_use', 'download_report', etc.
    page_url VARCHAR(500),
    time_spent_seconds INTEGER,
    activity_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_activities IS 'Tracks user activities and interactions';

-- 6. Page Analytics table
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id INTEGER REFERENCES users(id),
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(200),
  referrer VARCHAR(500),
  time_spent_seconds INTEGER,
  scroll_depth INTEGER,
  clicks_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE page_analytics IS 'Tracks page views, time spent, and user engagement metrics';
COMMENT ON COLUMN page_analytics.time_spent_seconds IS 'Time spent on page in seconds';
COMMENT ON COLUMN page_analytics.scroll_depth IS 'Maximum scroll depth percentage (0-100)';
COMMENT ON COLUMN page_analytics.clicks_count IS 'Number of clicks on the page';

-- 7. Click Stream tracking
CREATE TABLE IF NOT EXISTS click_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id INTEGER REFERENCES users(id),
  element_id VARCHAR(200),
  element_class VARCHAR(200),
  element_text TEXT,
  page_url VARCHAR(500),
  click_x INTEGER,
  click_y INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE click_streams IS 'Tracks user click behavior and interaction patterns';
COMMENT ON COLUMN click_streams.element_id IS 'HTML element ID that was clicked';
COMMENT ON COLUMN click_streams.element_class IS 'CSS class of the clicked element';
COMMENT ON COLUMN click_streams.click_x IS 'X coordinate of the click';
COMMENT ON COLUMN click_streams.click_y IS 'Y coordinate of the click';

-- 8. AI Usage Logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id INTEGER REFERENCES users(id),
  input_parameters JSONB NOT NULL,
  tokens_used INTEGER NOT NULL,
  model_used VARCHAR(50),
  response_time_ms INTEGER,
  cached BOOLEAN DEFAULT false,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ai_usage_logs IS 'Tracks AI API usage, token consumption, and costs';
COMMENT ON COLUMN ai_usage_logs.tokens_used IS 'Number of tokens consumed in the AI request';
COMMENT ON COLUMN ai_usage_logs.model_used IS 'AI model used (e.g., gemini-1.5-flash)';
COMMENT ON COLUMN ai_usage_logs.cached IS 'Whether the response was served from cache';
COMMENT ON COLUMN ai_usage_logs.cost_usd IS 'Cost of the AI request in USD';

-- 9. Analytics Summary (Aggregated Data)
-- Note: There are two versions of this table. This is the simpler version.
CREATE TABLE IF NOT EXISTS analytics_summary (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_calculations INTEGER DEFAULT 0,
    total_storage_tb DECIMAL(15,2) DEFAULT 0,
    total_savings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

COMMENT ON TABLE analytics_summary IS 'Aggregated analytics data for fast dashboard queries';

-- ============================================================================
-- CHAT & CONTEXT TABLES
-- ============================================================================

-- 10. Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE chat_messages IS 'Stores chat messages between users and AI';

-- 11. Calculation Contexts table
CREATE TABLE IF NOT EXISTS calculation_contexts (
    id SERIAL PRIMARY KEY,
    result_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    timestamp TIMESTAMP NOT NULL,
    params JSONB,
    summary TEXT,
    product_mapping JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE calculation_contexts IS 'Stores calculation contexts for chat awareness';

-- 12. Gemini Usage table
CREATE TABLE IF NOT EXISTS gemini_usage (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    endpoint VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    request_time TIMESTAMP NOT NULL,
    response_time TIMESTAMP NOT NULL,
    latency_ms INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'success' or 'error'
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    tokens_total INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 1,
    cost_estimate DECIMAL(10,4) DEFAULT 0,
    error_code VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE gemini_usage IS 'Tracks Gemini API usage analytics';

-- ============================================================================
-- ADDITIONAL ANALYTICS TABLES
-- ============================================================================

-- 13. User Analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
    id SERIAL PRIMARY KEY,
    user_session_id VARCHAR(100) NOT NULL,
    parameter_data JSONB NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    time_spent_seconds INTEGER DEFAULT 0,
    actions JSONB DEFAULT '[]',
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_analytics IS 'Tracks user behavior analytics';

-- 14. Calculator Interactions table
CREATE TABLE IF NOT EXISTS calculator_interactions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    parameters JSONB,
    timestamp TIMESTAMP NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE calculator_interactions IS 'Tracks calculator interactions';

-- 15. Recommendation Analytics table
CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    parameters JSONB,
    recommendation_data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE recommendation_analytics IS 'Tracks recommendation generation analytics';

-- ============================================================================
-- CONSULTATION & CONTACT TABLES
-- ============================================================================

-- 16. Consultation Enquiry table
CREATE TABLE IF NOT EXISTS consultation_enquiry (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone_number VARCHAR(20),
  area_of_interest VARCHAR(255),
  message_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE consultation_enquiry IS 'Stores consultation enquiries submitted through the contact form';
COMMENT ON COLUMN consultation_enquiry.message_content IS 'Full message content';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

-- AI Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_session_id ON ai_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);

-- Storage Cache indexes
CREATE INDEX IF NOT EXISTS idx_cache_input_hash ON storage_recommendations_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_cache_usage ON storage_recommendations_cache(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_cache_created_at ON storage_recommendations_cache(created_at DESC);

-- User Activities indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_session_id ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Page Analytics indexes
CREATE INDEX IF NOT EXISTS idx_page_analytics_session ON page_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_user ON page_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_url ON page_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON page_analytics(created_at);

-- Click Streams indexes
CREATE INDEX IF NOT EXISTS idx_click_streams_session ON click_streams(session_id);
CREATE INDEX IF NOT EXISTS idx_click_streams_user ON click_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_click_streams_timestamp ON click_streams(timestamp);

-- AI Usage Logs indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_session ON ai_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at);

-- Chat Messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Calculation Contexts indexes
CREATE INDEX IF NOT EXISTS idx_calculation_contexts_result_id ON calculation_contexts(result_id);
CREATE INDEX IF NOT EXISTS idx_calculation_contexts_user_id ON calculation_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_contexts_timestamp ON calculation_contexts(timestamp);

-- Gemini Usage indexes
CREATE INDEX IF NOT EXISTS idx_gemini_usage_session_id ON gemini_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_user_id ON gemini_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_created_at ON gemini_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_status ON gemini_usage(status);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_endpoint ON gemini_usage(endpoint);

-- User Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_session_id ON user_analytics(user_session_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- Calculator Interactions indexes
CREATE INDEX IF NOT EXISTS idx_calculator_interactions_session_id ON calculator_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_calculation_interactions_created_at ON calculator_interactions(created_at);

-- Recommendation Analytics indexes
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_session_id ON recommendation_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_created_at ON recommendation_analytics(created_at);

-- Consultation Enquiry indexes
CREATE INDEX IF NOT EXISTS idx_consultation_enquiry_email ON consultation_enquiry(email);
CREATE INDEX IF NOT EXISTS idx_consultation_enquiry_created_at ON consultation_enquiry(created_at DESC);

-- ============================================================================
-- VERIFICATION QUERIES (Run after setup to verify)
-- ============================================================================

-- Uncomment these to verify table creation:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================

