-- Add analytics tables for user behavior tracking
-- This migration adds comprehensive analytics tracking without pricing data

-- User Analytics Table
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

-- Calculator Interactions Table
CREATE TABLE IF NOT EXISTS calculator_interactions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    parameters JSONB,
    timestamp TIMESTAMP NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation Analytics Table
CREATE TABLE IF NOT EXISTS recommendation_analytics (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    parameters JSONB,
    recommendation_data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    page_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_session_id ON user_analytics(user_session_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_calculator_interactions_session_id ON calculator_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_calculator_interactions_created_at ON calculator_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_session_id ON recommendation_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_analytics_created_at ON recommendation_analytics(created_at);

-- Remove pricing columns from existing tables if they exist
-- Note: These ALTER TABLE statements will only work if the columns exist
-- They will be ignored if the columns don't exist (PostgreSQL behavior)

-- Remove pricing columns from ai_recommendations table
ALTER TABLE ai_recommendations DROP COLUMN IF EXISTS estimated_cost;
ALTER TABLE ai_recommendations DROP COLUMN IF EXISTS standard_cost;
ALTER TABLE ai_recommendations DROP COLUMN IF EXISTS savings_amount;

-- Remove pricing columns from analytics_summary table
ALTER TABLE analytics_summary DROP COLUMN IF EXISTS total_savings;

-- Update analytics_summary to remove pricing references
-- This will be handled by the application code, but we can add a comment
COMMENT ON TABLE analytics_summary IS 'Analytics summary without pricing data - focuses on usage metrics and storage calculations';
