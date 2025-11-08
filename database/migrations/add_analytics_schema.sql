-- Create analytics tables for comprehensive tracking
-- Page analytics table
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

-- Click stream tracking
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

-- AI usage tracking
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

-- Aggregate analytics summary (for fast queries)
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  hour INTEGER,
  metric_type VARCHAR(50) NOT NULL, -- 'page_view', 'calculator_use', 'ai_call', etc.
  metric_value JSONB NOT NULL,
  country_code VARCHAR(10),
  email_domain VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_analytics_session ON page_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_user ON page_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_page_analytics_url ON page_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_page_analytics_created_at ON page_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_click_streams_session ON click_streams(session_id);
CREATE INDEX IF NOT EXISTS idx_click_streams_user ON click_streams(user_id);
CREATE INDEX IF NOT EXISTS idx_click_streams_timestamp ON click_streams(timestamp);

CREATE INDEX IF NOT EXISTS idx_ai_usage_session ON ai_usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date, hour);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_type ON analytics_summary(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_country ON analytics_summary(country_code);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_domain ON analytics_summary(email_domain);

-- Add comments for documentation
COMMENT ON TABLE page_analytics IS 'Tracks page views, time spent, and user engagement metrics';
COMMENT ON TABLE click_streams IS 'Tracks user click behavior and interaction patterns';
COMMENT ON TABLE ai_usage_logs IS 'Tracks AI API usage, token consumption, and costs';
COMMENT ON TABLE analytics_summary IS 'Aggregated analytics data for fast dashboard queries';

COMMENT ON COLUMN page_analytics.time_spent_seconds IS 'Time spent on page in seconds';
COMMENT ON COLUMN page_analytics.scroll_depth IS 'Maximum scroll depth percentage (0-100)';
COMMENT ON COLUMN page_analytics.clicks_count IS 'Number of clicks on the page';

COMMENT ON COLUMN click_streams.element_id IS 'HTML element ID that was clicked';
COMMENT ON COLUMN click_streams.element_class IS 'CSS class of the clicked element';
COMMENT ON COLUMN click_streams.element_text IS 'Text content of the clicked element';
COMMENT ON COLUMN click_streams.click_x IS 'X coordinate of the click';
COMMENT ON COLUMN click_streams.click_y IS 'Y coordinate of the click';

COMMENT ON COLUMN ai_usage_logs.tokens_used IS 'Number of tokens consumed in the AI request';
COMMENT ON COLUMN ai_usage_logs.model_used IS 'AI model used (e.g., gemini-1.5-flash)';
COMMENT ON COLUMN ai_usage_logs.response_time_ms IS 'Response time in milliseconds';
COMMENT ON COLUMN ai_usage_logs.cached IS 'Whether the response was served from cache';
COMMENT ON COLUMN ai_usage_logs.cost_usd IS 'Cost of the AI request in USD';

COMMENT ON COLUMN analytics_summary.metric_type IS 'Type of metric (page_view, calculator_use, ai_call, etc.)';
COMMENT ON COLUMN analytics_summary.metric_value IS 'JSON object containing metric data';
COMMENT ON COLUMN analytics_summary.country_code IS 'Country code from user registration';
COMMENT ON COLUMN analytics_summary.email_domain IS 'Email domain for company analysis';
