# Analytics Integration Testing Guide

## Overview
This document provides comprehensive testing procedures for the analytics integration and pricing removal implementation.

## Pre-Testing Setup

### 1. Database Migration
Run the analytics tables migration:
```sql
-- Execute the migration script
\i database/migrations/add_analytics_tables.sql
```

### 2. Environment Setup
Ensure the following environment variables are set:
```bash
# .env.local
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=your_database_url_here
```

## Testing Checklist

### ✅ Frontend Changes Testing

#### 1. Pricing Removal Verification
- [ ] **RecommendationModal**: No price/cost fields displayed
- [ ] **AICalculator**: No cost calculations in results
- [ ] **PDF Generation**: No pricing information in generated PDFs
- [ ] **Admin Dashboard**: No pricing columns in analytics

#### 2. Analytics Tracking Verification
- [ ] **Parameter Changes**: Track when user changes dropdown values
- [ ] **Calculation Events**: Track when user clicks "Calculate Storage Needs"
- [ ] **Recommendation Generation**: Track when AI recommendations are generated
- [ ] **Session Tracking**: Track session start/end times
- [ ] **Time Tracking**: Track time spent actively using the application

### ✅ Backend API Testing

#### 1. Analytics Endpoints
Test the following endpoints with Postman or curl:

**POST /api/analytics/track**
```json
{
  "userSessionId": "test_session_123",
  "parameterSelections": {
    "cameras": 10,
    "resolution": "4K",
    "fps": 30,
    "codec": "H.265",
    "quality": "Medium",
    "activityPercent": 70,
    "recordingHoursPerDay": 24,
    "retentionDays": 30,
    "recordingMode": "continuous"
  },
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:05:00Z",
  "timeSpent": 300,
  "actionSequence": ["parameter_change_cameras", "calculation_start", "recommendation_generated"],
  "pageUrl": "http://localhost:3000",
  "userAgent": "Mozilla/5.0..."
}
```

**POST /api/analytics/calculator-interaction**
```json
{
  "sessionId": "test_session_123",
  "action": "parameter_change_resolution",
  "parameters": {"resolution": "4K"},
  "timestamp": "2024-01-15T10:01:00Z",
  "pageUrl": "http://localhost:3000"
}
```

**POST /api/analytics/recommendation-generated**
```json
{
  "sessionId": "test_session_123",
  "parameters": {
    "cameras": 10,
    "resolution": "4K"
  },
  "recommendationData": {
    "product_name": "AeroFlex AF-1632 NVR",
    "storage_tb": 15.5,
    "bitrate": 120
  },
  "timestamp": "2024-01-15T10:02:00Z",
  "pageUrl": "http://localhost:3000"
}
```

#### 2. Data Retrieval Testing
**GET /api/analytics/track**
- Test with sessionId parameter
- Test without parameters (should return paginated results)
- Test pagination with page and limit parameters

**GET /api/analytics/calculator-interaction**
- Test session-specific queries
- Test pagination

**GET /api/analytics/recommendation-generated**
- Test session-specific queries
- Test pagination

### ✅ Database Schema Testing

#### 1. Table Creation Verification
```sql
-- Check if analytics tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('user_analytics', 'calculator_interactions', 'recommendation_analytics');

-- Check table structures
\d user_analytics;
\d calculator_interactions;
\d recommendation_analytics;
```

#### 2. Pricing Column Removal Verification
```sql
-- Check if pricing columns were removed
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'ai_recommendations' 
AND column_name IN ('estimated_cost', 'standard_cost', 'savings_amount');

-- Should return no rows if removal was successful
```

#### 3. Data Insertion Testing
```sql
-- Test inserting analytics data
INSERT INTO user_analytics (
  user_session_id, parameter_data, start_time, time_spent_seconds, actions, page_url, user_agent
) VALUES (
  'test_session_001',
  '{"cameras": 5, "resolution": "1080p"}',
  NOW(),
  120,
  '["parameter_change", "calculation_start"]',
  'http://localhost:3000',
  'Mozilla/5.0...'
);

-- Verify insertion
SELECT * FROM user_analytics WHERE user_session_id = 'test_session_001';
```

### ✅ Integration Testing

#### 1. End-to-End User Flow
1. **Open Calculator**: Navigate to main page
2. **Fill Parameters**: Change camera count, resolution, etc.
3. **Calculate**: Click "Calculate Storage Needs"
4. **View Results**: Check recommendation modal
5. **Download PDF**: Test PDF generation
6. **Check Analytics**: Verify data was tracked

#### 2. Analytics Data Verification
```sql
-- Check if analytics data is being captured
SELECT 
  user_session_id,
  parameter_data,
  time_spent_seconds,
  actions,
  created_at
FROM user_analytics 
ORDER BY created_at DESC 
LIMIT 10;

-- Check calculator interactions
SELECT 
  session_id,
  action,
  parameters,
  timestamp
FROM calculator_interactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check recommendation analytics
SELECT 
  session_id,
  recommendation_data,
  timestamp
FROM recommendation_analytics 
ORDER BY created_at DESC 
LIMIT 10;
```

### ✅ Performance Testing

#### 1. Analytics Endpoint Performance
- Test response times for analytics endpoints
- Verify no blocking of main application functionality
- Check database query performance

#### 2. Frontend Performance
- Verify analytics tracking doesn't slow down UI
- Check memory usage with analytics tracking
- Test with multiple concurrent users

### ✅ Error Handling Testing

#### 1. Invalid Data Testing
- Send malformed JSON to analytics endpoints
- Test with missing required fields
- Verify graceful error handling

#### 2. Database Connection Testing
- Test behavior when database is unavailable
- Verify fallback mechanisms work
- Check error logging

## Postman Collection

### Analytics Testing Collection
```json
{
  "info": {
    "name": "Aeroskop Analytics Testing",
    "description": "Test collection for analytics integration"
  },
  "item": [
    {
      "name": "Track User Analytics",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userSessionId\": \"test_session_123\",\n  \"parameterSelections\": {\n    \"cameras\": 10,\n    \"resolution\": \"4K\",\n    \"fps\": 30,\n    \"codec\": \"H.265\",\n    \"quality\": \"Medium\",\n    \"activityPercent\": 70,\n    \"recordingHoursPerDay\": 24,\n    \"retentionDays\": 30,\n    \"recordingMode\": \"continuous\"\n  },\n  \"startTime\": \"2024-01-15T10:00:00Z\",\n  \"timeSpent\": 300,\n  \"actionSequence\": [\"parameter_change_cameras\", \"calculation_start\"],\n  \"pageUrl\": \"http://localhost:3000\",\n  \"userAgent\": \"Mozilla/5.0...\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/analytics/track",
          "host": ["{{baseUrl}}"],
          "path": ["api", "analytics", "track"]
        }
      }
    }
  ]
}
```

## Expected Results

### ✅ Success Criteria
1. **No Pricing Data**: All price/cost references removed from UI and backend
2. **Analytics Tracking**: User interactions are properly captured
3. **Database Storage**: Analytics data is stored correctly
4. **Performance**: No significant impact on application performance
5. **Error Handling**: Graceful handling of analytics failures

### ✅ Data Quality Checks
1. **Completeness**: All required analytics fields are captured
2. **Accuracy**: Parameter values match user inputs
3. **Timing**: Timestamps are accurate
4. **Consistency**: Data format is consistent across all analytics tables

## Troubleshooting

### Common Issues
1. **Analytics Not Tracking**: Check browser console for errors
2. **Database Errors**: Verify table creation and permissions
3. **Performance Issues**: Check database indexes and query optimization
4. **Missing Data**: Verify API endpoint configurations

### Debug Commands
```bash
# Check application logs
npm run dev

# Check database connectivity
psql -d your_database -c "SELECT COUNT(*) FROM user_analytics;"

# Test API endpoints
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"userSessionId":"test","parameterSelections":{}}'
```

## Conclusion
This testing guide ensures comprehensive validation of the analytics integration and pricing removal implementation. Follow these steps systematically to verify all functionality works as expected.
