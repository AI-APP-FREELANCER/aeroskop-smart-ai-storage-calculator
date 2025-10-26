-- Add new tables for chat context and Gemini analytics

-- Table for storing calculation contexts for chat awareness
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

-- Table for storing chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Gemini usage analytics
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_calculation_contexts_result_id ON calculation_contexts (result_id);
CREATE INDEX IF NOT EXISTS idx_calculation_contexts_user_id ON calculation_contexts (user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_contexts_timestamp ON calculation_contexts (timestamp);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at);

CREATE INDEX IF NOT EXISTS idx_gemini_usage_session_id ON gemini_usage (session_id);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_user_id ON gemini_usage (user_id);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_created_at ON gemini_usage (created_at);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_status ON gemini_usage (status);
CREATE INDEX IF NOT EXISTS idx_gemini_usage_endpoint ON gemini_usage (endpoint);
