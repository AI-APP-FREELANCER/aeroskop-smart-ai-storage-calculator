# Backend Configuration Summary

## Database Connection Configuration

### Connection String Format
The application uses PostgreSQL database with the following connection configuration:

**Primary Method: DATABASE_URL**
```
postgresql://username:password@host:port/database
```

**Example (Production):**
```
postgresql://aeroskop_user:aeroskop_password@aeroskop-storage-db-new.creceysaubfa.me-south-1.rds.amazonaws.com:5432/postgres
```

**Fallback Method: Individual Environment Variables**
- `DB_HOST` (default: `localhost`)
- `DB_PORT` (default: `5432`)
- `DB_NAME` (default: `aeroskop_db`)
- `DB_USER` (default: `aeroskop_user`)
- `DB_PASSWORD` (default: `aeroskop_password`)
- `DB_SSL` (default: `false`, set to `true` for AWS RDS)

**SSL Configuration:**
- Automatically enabled for AWS RDS (hostname contains `amazonaws.com`)
- SSL mode: `{ rejectUnauthorized: false }`

**Connection Pool:**
- Uses `pg` (node-postgres) Pool for connection management
- Location: `src/lib/db.ts`

---

## AI Model Configuration

### Primary AI Model: Google Gemini

**Model:** `gemini-1.5-flash`

**Configuration:**
- API Key: `GEMINI_API_KEY` (environment variable)
- Model Name: `gemini-1.5-flash` (hardcoded)
- Library: `@google/generative-ai`

**Usage Locations:**
1. **Chat API:** `src/app/api/gemini-chat/route.ts`
   - Used for conversational AI chat
   - Maintains conversation history
   - Uses `startChat()` with history for context

2. **Storage Recommendations:** `src/lib/gemini.ts`
   - Used for storage calculation recommendations
   - Generates product recommendations based on input parameters

3. **System Recommendations:** `src/app/api/ai-system-recommendations/route.ts`
   - Used for system configuration recommendations

**System Prompt (Chat):**
```
You are a helpful and knowledgeable AI assistant specializing in surveillance camera systems, storage solutions, and related technical topics. 

Key capabilities:
- Answer questions directly and succinctly based on conversation context
- Reference previous recommendations, calculations, or products mentioned in the conversation
- When a user asks follow-up questions (e.g., "give me best resolution for the above recommendation"), provide specific answers based on what was previously discussed
- Be conversational, friendly, and provide accurate, helpful information
- If you don't have enough context, ask clarifying questions rather than providing generic lists

Remember: Always maintain conversation context and answer directly based on what was previously discussed.
```


---

## Database Tables and Columns

### 1. `users` Table
**Purpose:** Registered user accounts

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing user ID |
| `first_name` | VARCHAR(100) | NOT NULL | User's first name |
| `last_name` | VARCHAR(100) | NOT NULL | User's last name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| `country_code` | VARCHAR(10) | NOT NULL | Country code |
| `phone_number` | VARCHAR(20) | NOT NULL | Phone number |
| `company` | VARCHAR(255) | | Company name (optional) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- Primary key on `id`

---

### 2. `sessions` Table
**Purpose:** User session tracking

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session ID |
| `user_id` | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Foreign key to users table |
| `session_type` | VARCHAR(20) | DEFAULT 'guest' | 'user' or 'guest' |
| `ip_address` | INET | | User's IP address |
| `user_agent` | TEXT | | Browser user agent |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session creation time |
| `last_activity` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last activity timestamp |
| `is_active` | BOOLEAN | DEFAULT true | Session active status |

**Indexes:**
- `idx_sessions_user_id` on `user_id`
- `idx_sessions_created_at` on `created_at`

---

### 3. `ai_recommendations` Table
**Purpose:** AI-generated storage recommendations

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique recommendation ID |
| `session_id` | UUID | REFERENCES sessions(id) ON DELETE CASCADE | Foreign key to sessions |
| `user_id` | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Foreign key to users |
| `cameras` | INTEGER | NOT NULL | Number of cameras |
| `resolution` | VARCHAR(20) | NOT NULL | Video resolution |
| `fps` | INTEGER | NOT NULL | Frames per second |
| `codec` | VARCHAR(10) | NOT NULL | Video codec (H.264, H.265, etc.) |
| `activity_level` | VARCHAR(20) | NOT NULL | Activity level |
| `retention_days` | INTEGER | NOT NULL | Retention period in days |
| `recording_mode` | VARCHAR(20) | NOT NULL | Recording mode |
| `total_storage_tb` | DECIMAL(10,2) | NOT NULL | Total storage required in TB |
| `daily_storage_tb` | DECIMAL(10,2) | NOT NULL | Daily storage in TB |
| `total_bitrate_mbps` | DECIMAL(10,2) | NOT NULL | Total bitrate in Mbps |
| `ai_insights` | JSONB | | AI-generated insights |
| `optimization_suggestions` | JSONB | | Optimization suggestions |
| `risk_assessment` | JSONB | | Risk assessment data |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_ai_recommendations_session_id` on `session_id`
- `idx_ai_recommendations_created_at` on `created_at`

---

### 4. `user_activities` Table
**Purpose:** User activity tracking

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique activity ID |
| `session_id` | UUID | REFERENCES sessions(id) ON DELETE CASCADE | Foreign key to sessions |
| `user_id` | INTEGER | REFERENCES users(id) ON DELETE CASCADE | Foreign key to users |
| `activity_type` | VARCHAR(50) | NOT NULL | Activity type (page_view, calculator_use, etc.) |
| `page_url` | VARCHAR(500) | | Page URL |
| `time_spent_seconds` | INTEGER | | Time spent in seconds |
| `activity_data` | JSONB | | Additional activity data |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Activity timestamp |

**Indexes:**
- `idx_user_activities_session_id` on `session_id`
- `idx_user_activities_created_at` on `created_at`

---

### 5. `analytics_summary` Table
**Purpose:** Aggregated analytics data

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `date` | DATE | NOT NULL, UNIQUE | Summary date |
| `total_users` | INTEGER | DEFAULT 0 | Total users |
| `total_sessions` | INTEGER | DEFAULT 0 | Total sessions |
| `total_calculations` | INTEGER | DEFAULT 0 | Total calculations |
| `total_storage_tb` | DECIMAL(15,2) | DEFAULT 0 | Total storage in TB |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- Unique constraint on `date`

---

### 6. `calculation_contexts` Table
**Purpose:** Calculation context for chat awareness

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `result_id` | VARCHAR(100) | UNIQUE, NOT NULL | Unique result identifier |
| `user_id` | VARCHAR(100) | | User ID (nullable) |
| `timestamp` | TIMESTAMP | NOT NULL | Calculation timestamp |
| `params` | JSONB | | Calculation parameters |
| `summary` | TEXT | | Calculation summary |
| `product_mapping` | JSONB | | Product mapping data |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_calculation_contexts_result_id` on `result_id`
- `idx_calculation_contexts_user_id` on `user_id`
- `idx_calculation_contexts_timestamp` on `timestamp`

---

### 7. `chat_messages` Table
**Purpose:** Chat conversation history

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing message ID |
| `session_id` | VARCHAR(100) | NOT NULL | Chat session identifier |
| `sender` | VARCHAR(20) | NOT NULL | 'user' or 'ai' |
| `message` | TEXT | NOT NULL | Message content |
| `metadata` | JSONB | | Additional metadata (pageUrl, etc.) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Indexes:**
- `idx_chat_messages_session_id` on `session_id`
- `idx_chat_messages_created_at` on `created_at`

---

### 8. `gemini_usage` Table
**Purpose:** Gemini API usage analytics

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `session_id` | VARCHAR(100) | NOT NULL | Session identifier |
| `user_id` | VARCHAR(100) | | User ID (nullable) |
| `endpoint` | VARCHAR(100) | NOT NULL | API endpoint |
| `model` | VARCHAR(50) | NOT NULL | AI model used |
| `request_time` | TIMESTAMP | NOT NULL | Request timestamp |
| `response_time` | TIMESTAMP | NOT NULL | Response timestamp |
| `latency_ms` | INTEGER | NOT NULL | Response latency in milliseconds |
| `status` | VARCHAR(20) | NOT NULL | 'success' or 'error' |
| `tokens_input` | INTEGER | DEFAULT 0 | Input tokens |
| `tokens_output` | INTEGER | DEFAULT 0 | Output tokens |
| `tokens_total` | INTEGER | DEFAULT 0 | Total tokens |
| `api_calls_count` | INTEGER | DEFAULT 1 | Number of API calls |
| `cost_estimate` | DECIMAL(10,4) | DEFAULT 0 | Estimated cost |
| `error_code` | VARCHAR(50) | | Error code (if error) |
| `error_message` | TEXT | | Error message (if error) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_gemini_usage_session_id` on `session_id`
- `idx_gemini_usage_user_id` on `user_id`
- `idx_gemini_usage_created_at` on `created_at`
- `idx_gemini_usage_status` on `status`
- `idx_gemini_usage_endpoint` on `endpoint`

---

### 9. `page_analytics` Table
**Purpose:** Page view analytics

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique analytics ID |
| `session_id` | UUID | REFERENCES sessions(id) | Foreign key to sessions |
| `user_id` | INTEGER | REFERENCES users(id) | Foreign key to users |
| `page_url` | VARCHAR(500) | NOT NULL | Page URL |
| `page_title` | VARCHAR(200) | | Page title |
| `referrer` | VARCHAR(500) | | Referrer URL |
| `time_spent_seconds` | INTEGER | | Time spent on page |
| `scroll_depth` | INTEGER | | Maximum scroll depth (0-100) |
| `clicks_count` | INTEGER | | Number of clicks |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Analytics timestamp |

**Indexes:**
- `idx_page_analytics_session` on `session_id`
- `idx_page_analytics_user` on `user_id`
- `idx_page_analytics_url` on `page_url`
- `idx_page_analytics_created_at` on `created_at`

---

### 10. `click_streams` Table
**Purpose:** Click stream tracking

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique click ID |
| `session_id` | UUID | REFERENCES sessions(id) | Foreign key to sessions |
| `user_id` | INTEGER | REFERENCES users(id) | Foreign key to users |
| `element_id` | VARCHAR(200) | | HTML element ID |
| `element_class` | VARCHAR(200) | | CSS class |
| `element_text` | TEXT | | Element text content |
| `page_url` | VARCHAR(500) | | Page URL |
| `click_x` | INTEGER | | X coordinate of click |
| `click_y` | INTEGER | | Y coordinate of click |
| `timestamp` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Click timestamp |

**Indexes:**
- `idx_click_streams_session` on `session_id`
- `idx_click_streams_user` on `user_id`
- `idx_click_streams_timestamp` on `timestamp`

---

### 11. `ai_usage_logs` Table
**Purpose:** AI API usage logging

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique log ID |
| `session_id` | UUID | REFERENCES sessions(id) | Foreign key to sessions |
| `user_id` | INTEGER | REFERENCES users(id) | Foreign key to users |
| `input_parameters` | JSONB | NOT NULL | Input parameters |
| `tokens_used` | INTEGER | NOT NULL | Tokens consumed |
| `model_used` | VARCHAR(50) | | AI model used |
| `response_time_ms` | INTEGER | | Response time in milliseconds |
| `cached` | BOOLEAN | DEFAULT false | Whether response was cached |
| `cost_usd` | NUMERIC(10,4) | | Cost in USD |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Log timestamp |

**Indexes:**
- `idx_ai_usage_session` on `session_id`
- `idx_ai_usage_user` on `user_id`
- `idx_ai_usage_created_at` on `created_at`

---

### 12. `storage_recommendations_cache` Table
**Purpose:** Cache for AI-generated storage recommendations

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique cache entry ID |
| `input_hash` | VARCHAR(64) | UNIQUE, NOT NULL | MD5 hash of input parameters |
| `cameras` | INTEGER | NOT NULL | Number of cameras |
| `resolution` | VARCHAR(20) | NOT NULL | Video resolution |
| `fps` | INTEGER | NOT NULL | Frames per second |
| `codec` | VARCHAR(10) | NOT NULL | Video codec |
| `activity_level` | VARCHAR(20) | NOT NULL | Activity level |
| `retention_days` | INTEGER | NOT NULL | Retention days |
| `recording_mode` | VARCHAR(20) | NOT NULL | Recording mode |
| `recommended_product_good` | JSONB | NOT NULL | Good tier recommendation |
| `recommended_product_better` | JSONB | NOT NULL | Better tier recommendation |
| `recommended_product_best` | JSONB | NOT NULL | Best tier recommendation |
| `storage_calculation` | JSONB | NOT NULL | Storage calculation data |
| `optimization_suggestions` | JSONB | NOT NULL | Optimization suggestions |
| `cost_analysis` | JSONB | | Cost analysis data |
| `ai_insights` | TEXT | | AI insights |
| `total_storage_tb` | NUMERIC(10,2) | | Total storage in TB |
| `daily_storage_tb` | NUMERIC(10,2) | | Daily storage in TB |
| `estimated_cost` | NUMERIC(10,2) | | Estimated cost |
| `usage_count` | INTEGER | DEFAULT 1 | Cache hit count |
| `last_accessed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last access timestamp |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_cache_input_hash` on `input_hash`
- `idx_cache_usage` on `usage_count DESC`
- `idx_cache_created_at` on `created_at DESC`

---

### 13. `user_analytics` Table
**Purpose:** User analytics tracking

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `user_session_id` | VARCHAR(100) | NOT NULL | User session identifier |
| `parameter_data` | JSONB | NOT NULL | Parameter data |
| `start_time` | TIMESTAMP | NOT NULL | Session start time |
| `end_time` | TIMESTAMP | | Session end time |
| `time_spent_seconds` | INTEGER | DEFAULT 0 | Time spent in seconds |
| `actions` | JSONB | DEFAULT '[]' | User actions |
| `page_url` | TEXT | | Page URL |
| `user_agent` | TEXT | | Browser user agent |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_user_analytics_session_id` on `user_session_id`
- `idx_user_analytics_created_at` on `created_at`

---

### 14. `calculator_interactions` Table
**Purpose:** Calculator interaction tracking

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `session_id` | VARCHAR(100) | NOT NULL | Session identifier |
| `action` | VARCHAR(100) | NOT NULL | Action type |
| `parameters` | JSONB | | Action parameters |
| `timestamp` | TIMESTAMP | NOT NULL | Action timestamp |
| `page_url` | TEXT | | Page URL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_calculator_interactions_session_id` on `session_id`
- `idx_calculator_interactions_created_at` on `created_at`

---

### 15. `recommendation_analytics` Table
**Purpose:** Recommendation analytics tracking

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing ID |
| `session_id` | VARCHAR(100) | NOT NULL | Session identifier |
| `parameters` | JSONB | | Input parameters |
| `recommendation_data` | JSONB | NOT NULL | Recommendation data |
| `timestamp` | TIMESTAMP | NOT NULL | Recommendation timestamp |
| `page_url` | TEXT | | Page URL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- `idx_recommendation_analytics_session_id` on `session_id`
- `idx_recommendation_analytics_created_at` on `created_at`

---

## Environment Variables Summary

### Required Environment Variables

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (primary)
- OR individual variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`

**AI Configuration:**
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `GEMINI_MODEL` - Gemini model name (default: `gemini-1.5-flash`)


**Application:**
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: `3000`)

---

## Database Migration Files

All migration files are located in `database/migrations/`:

1. `schema.sql` - Base schema (users, sessions, ai_recommendations, user_activities, analytics_summary)
2. `add_chat_and_analytics_tables.sql` - Chat and Gemini analytics tables
3. `add_analytics_schema.sql` - Page analytics, click streams, AI usage logs
4. `add_analytics_tables.sql` - User analytics, calculator interactions, recommendation analytics
5. `add_storage_cache.sql` - Storage recommendations cache table
6. `add_hanwha_cameras.sql` - Hanwha camera specifications (if exists)

---

## Notes

- All timestamps use `TIMESTAMP` type with `DEFAULT CURRENT_TIMESTAMP`
- JSONB columns are used for flexible JSON data storage
- UUIDs are generated using `gen_random_uuid()` for primary keys
- Foreign keys use `ON DELETE CASCADE` for automatic cleanup
- Indexes are created for performance on frequently queried columns
- SSL is automatically enabled for AWS RDS connections

