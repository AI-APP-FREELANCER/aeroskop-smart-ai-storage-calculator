-- Users table for registered users
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

-- Sessions table for user sessions
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

-- AI Recommendations table
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

-- User Activity Tracking
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

-- Analytics Aggregated Data
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_session_id ON ai_recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_session_id ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);
