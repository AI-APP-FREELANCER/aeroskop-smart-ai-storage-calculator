-- Create storage_recommendations_cache table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_input_hash ON storage_recommendations_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_cache_usage ON storage_recommendations_cache(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_cache_created_at ON storage_recommendations_cache(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE storage_recommendations_cache IS 'Cache table for AI-generated storage recommendations to avoid duplicate OpenAI API calls';
COMMENT ON COLUMN storage_recommendations_cache.input_hash IS 'MD5 hash of input parameters for fast cache lookup';
COMMENT ON COLUMN storage_recommendations_cache.usage_count IS 'Number of times this cached recommendation has been accessed';
COMMENT ON COLUMN storage_recommendations_cache.recommended_product_good IS 'JSON data for the Good tier recommendation';
COMMENT ON COLUMN storage_recommendations_cache.recommended_product_better IS 'JSON data for the Better tier recommendation';
COMMENT ON COLUMN storage_recommendations_cache.recommended_product_best IS 'JSON data for the Best tier recommendation';
