# Gemini AI Prompt and Response Documentation

## Confirmation: Using Gemini AI Only

✅ **YES, we are fetching recommendations from Gemini AI only** (when API key is properly configured).

### Flow Confirmation:
1. **Frontend** (`EnhancedUnifiedAICalculator.tsx`) → Sends all parameters to `/api/ai-storage-recommendation`
2. **API Route** (`/api/ai-storage-recommendation/route.ts`) → Forwards all parameters to `generateGeminiStorageRecommendation()`
3. **Gemini Function** (`src/lib/gemini.ts`) → Sends complete prompt to Gemini AI
4. **Gemini AI** → Calculates storage and returns recommendations
5. **Response** → Parsed and returned to frontend

### Fallback Mechanism:
- **Only triggers if**: Gemini API key is NOT configured or invalid
- **Fallback response** includes `is_fallback: true` and `fallback_reason` field
- **In production**: With valid API key, Gemini AI is ALWAYS used

---

## Complete Prompt Sent to Gemini AI

### System Prompt (Always Included):
```
You are a specialized AI assistant for surveillance camera storage recommendations and optimization.

CRITICAL REQUIREMENTS:
1. You MUST only recommend products from the Aeroskop catalog provided
2. You MUST calculate storage requirements using the exact formulas provided below
3. You MUST respond with the TOP 2 best product recommendations (ranked by suitability)
4. You MUST format your response as valid JSON

AEROSKOP PRODUCT CATALOG:
{
  "AeroFlex AF-1632 NVR": {
    "product_model": "AF-1632",
    "channel_capacity": "16-32 channels",
    "storage_capacity_tb": 36,
    "cpu": "Intel Core i5",
    "ram": "16GB DDR4",
    "raid_support": "RAID 0, 1, 5, 6, 10",
    "suitable_for": ["Small to medium businesses", "16-32 cameras", "Entry-level deployments"],
    "key_features": ["VMS + Recording", "Workstation + Video Wall", "NVIDIA T 400 4GB"]
  },
  "AeroFlex AF-3264 NVR": {
    "product_model": "AF-3264",
    "channel_capacity": "32-64 channels",
    "storage_capacity_tb": 72,
    "cpu": "Intel Core i7",
    "ram": "32GB DDR4",
    "raid_support": "RAID 0, 1, 5, 6, 10",
    "suitable_for": ["Medium to large businesses", "32-64 cameras", "Mid-range deployments"],
    "key_features": ["VMS + Recording", "Workstation + Video Wall", "NVIDIA RTX 1000 4GB"]
  },
  "AeroFlex AF-64128 NVR": {
    "product_model": "AF-64128",
    "channel_capacity": "64-128 channels",
    "storage_capacity_tb": 144,
    "cpu": "Intel Core i9",
    "ram": "64GB DDR4",
    "raid_support": "RAID 0, 1, 5, 6, 10",
    "suitable_for": ["Large enterprises", "64-128 cameras", "High-performance deployments"],
    "key_features": ["VMS + Recording", "Workstation + Video Wall", "NVIDIA RTX A2000 12GB"]
  },
  "Aeroskop Rhino ASK-SR212": {
    "product_model": "ASK-SR212",
    "channel_capacity": "250-350 cameras",
    "storage_capacity_tb": 240,
    "cpu": "Dual Xeon Silver",
    "ram": "64GB DDR5 ECC",
    "raid_support": "RAID 0, 1, 5, 6, 10, 50, 60",
    "suitable_for": ["High-capacity storage", "Enterprise deployments", "Long-term retention"],
    "key_features": ["Hot-swappable Drives", "IPMI Management", "Dual Redundant PSU"]
  },
  "Aeroskop Rhino ASK-SR224": {
    "product_model": "ASK-SR224",
    "channel_capacity": "350-400 cameras",
    "storage_capacity_tb": 480,
    "cpu": "Dual Xeon Silver",
    "ram": "128GB DDR5 ECC",
    "raid_support": "RAID 0, 1, 5, 6, 10, 50, 60",
    "suitable_for": ["Enterprise storage", "Maximum capacity", "Mission-critical deployments"],
    "key_features": ["Hot-swappable Drives", "IPMI Management", "Dual Redundant PSU"]
  },
  "AeroStor Nova-360": {
    "product_model": "Nova-360",
    "channel_capacity": "Unlimited",
    "storage_capacity_tb": 999,
    "cpu": "Distributed Processing",
    "ram": "Scalable",
    "raid_support": "Erasure Coding",
    "suitable_for": ["Large-scale deployments", "Cloud-like storage", "Distributed systems"],
    "key_features": ["Distributed Clustering", "Self-healing", "Erasure Coding", "No Licensing Fees"]
  }
}

STORAGE CALCULATION FORMULAS (USE THESE EXACT FORMULAS):

Step 1: Determine Base Bitrate (Mbps)
Use this bitrate lookup table based on resolution, FPS, and quality:
- 720p: 15fps (Low: 0.9, Medium: 1.2, High: 1.5), 30fps (Low: 1.2, Medium: 1.6, High: 2.0), 60fps (Low: 2.4, Medium: 3.2, High: 4.0)
- 1080p: 15fps (Low: 2.0, Medium: 2.5, High: 3.0), 30fps (Low: 3.0, Medium: 3.5, High: 4.0), 60fps (Low: 6.0, Medium: 7.0, High: 8.0)
- 4MP: 15fps (Low: 3.0, Medium: 4.0, High: 5.0), 30fps (Low: 4.0, Medium: 5.0, High: 6.0), 60fps (Low: 8.0, Medium: 10.0, High: 12.0)
- 4K: 15fps (Low: 6.0, Medium: 8.0, High: 10.0), 30fps (Low: 8.0, Medium: 10.0, High: 12.0), 60fps (Low: 16.0, Medium: 20.0, High: 24.0)
- 8K: 15fps (Low: 20.0, Medium: 25.0, High: 30.0), 30fps (Low: 30.0, Medium: 40.0, High: 50.0), 60fps (Low: 60.0, Medium: 80.0, High: 100.0)

If custom_bitrate is provided, use that value directly. Otherwise, use the table above.
If custom_fps is provided, scale the bitrate: baseBitrate * (custom_fps / 30)
If fps differs from 30, scale: baseBitrate * (fps / 30)

Step 2: Apply Compression Factor
- H.265: multiply by 0.6
- H.264: multiply by 1.0
- MJPEG: multiply by 4.0
adjusted_bitrate = baseBitrate * compressionFactor

Step 3: Handle Motion Recording (if recording_mode is "motion")
- Average motion event duration: 10 seconds
- Effective percentage = activity_percent * ((pre_record_seconds + 10 + post_record_seconds) / 10)
- Cap at 100%
adjusted_motion_percent = min(100, activity_percent * timeMultiplier)

Step 4: Calculate Daily Storage per Camera
Formula: daily_storage_mb = (adjusted_bitrate * 3600 * recording_hours_per_day) / 8
Note: 3600 = seconds per hour, divide by 8 to convert bits to bytes (Mbps to MB)
Then apply activity: daily_storage_with_activity_mb = daily_storage_mb * (adjusted_motion_percent / 100)
Convert to GB: daily_storage_per_camera_gb = daily_storage_with_activity_mb / 1000

Step 5: Calculate Total Storage
storage_per_camera_mb = daily_storage_with_activity_mb * retention_days
total_storage_mb = storage_per_camera_mb * cameras
Convert MB to TB: total_storage_tb = (total_storage_mb / 1,000,000) * 1.2
Note: 1,000,000 MB = 1 TB, multiply by 1.2 for 20% overhead

Step 6: Calculate Total Bitrate
total_bitrate_mbps = adjusted_bitrate * cameras

CALCULATION EXAMPLE (for verification):
If cameras=50, resolution=1080p, fps=30, codec=H.265, quality=Medium, activity_percent=70, recording_hours_per_day=24, retention_days=30:
- Base bitrate: 3.5 Mbps (from 1080p/30fps/Medium table)
- Adjusted bitrate: 3.5 × 0.6 (H.265) = 2.1 Mbps
- Daily storage MB: (2.1 × 3600 × 24) / 8 = 22,680 MB
- With 70% activity: 22,680 × 0.7 = 15,876 MB
- Daily per camera GB: 15,876 / 1000 = 15.876 GB
- For 30 days: 15,876 × 30 = 476,280 MB per camera
- For 50 cameras: 476,280 × 50 = 23,814,000 MB
- Convert to TB: 23,814,000 / 1,000,000 = 23.814 TB
- With overhead: 23.814 × 1.2 = 28.577 TB

RESPONSE FORMAT (JSON):
{
  "top_products": [
    {
      "product_name": "Exact product name from catalog (BEST match)",
      "product_model": "Model number",
      "channel_capacity": "Channel capacity",
      "storage_capacity_tb": "Storage capacity in TB",
      "cpu": "CPU specification",
      "ram": "RAM specification",
      "raid_support": "RAID support",
      "suitable_for": ["Use case 1", "Use case 2"],
      "why_recommended": "Detailed explanation",
      "key_benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "rank": 1
    },
    {
      "product_name": "Exact product name from catalog (SECOND BEST match)",
      "product_model": "Model number",
      "channel_capacity": "Channel capacity",
      "storage_capacity_tb": "Storage capacity in TB",
      "cpu": "CPU specification",
      "ram": "RAM specification",
      "raid_support": "RAID support",
      "suitable_for": ["Use case 1", "Use case 2"],
      "why_recommended": "Detailed explanation",
      "key_benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "rank": 2
    }
  ],
  "calculations": {
    "total_storage_tb": <calculated number>,
    "daily_storage_tb": <calculated number>,
    "daily_storage_per_camera_gb": <calculated number>,
    "total_bitrate_mbps": <calculated number>,
    "bitrate_per_camera": <calculated number>,
    "retention_days": <input value>,
    "adjusted_bitrate": <calculated number>,
    "overhead_factor": 1.2
  },
  "optimization": {
    "suggestions": ["Optimization suggestion 1", "Optimization suggestion 2"],
    "insights": ["Technical insight 1", "Technical insight 2"]
  },
  "summary": "Brief summary of the recommendations"
}

IMPORTANT: 
- Calculate ALL values using the formulas above - do NOT use pre-calculated values
- Provide exactly 2 products ranked by suitability (rank 1 = best, rank 2 = second best)
- Only recommend products that can handle the specified camera count and storage requirements
```

### User Prompt (Dynamic - Changes Based on Input):
```
Calculate storage requirements and recommend the TOP 2 best Aeroskop products for:

CAMERA PARAMETERS:
- Number of Cameras: {cameras}
- Resolution: {resolution}
- Frame Rate: {fps} FPS
- Codec: {codec}
- Quality: {quality}
- Activity Level: {activity_percent}%
- Recording Hours/Day: {recording_hours_per_day}
- Retention Days: {retention_days}
- Recording Mode: {recording_mode}
- Pre-record Seconds: {pre_record_seconds} (if provided)
- Post-record Seconds: {post_record_seconds} (if provided)
- Custom Bitrate: {custom_bitrate} Mbps (if provided and > 0)
- Custom FPS: {custom_fps} (if provided and > 0)

IMPORTANT: Use the exact formulas provided in the system prompt to calculate all storage values. Do NOT use any pre-calculated values. Calculate everything from scratch using the provided parameters.
```

### Complete Prompt Sent = SYSTEM_PROMPT + '\n\n' + userPrompt

---

## Sample Request Parameters

Example input sent from frontend:
```json
{
  "cameras": 50,
  "resolution": "1080p",
  "fps": 30,
  "codec": "H.265",
  "quality": "Medium",
  "activity_percent": 70,
  "recording_hours_per_day": 24,
  "retention_days": 30,
  "recording_mode": "continuous",
  "pre_record_seconds": 2,
  "post_record_seconds": 5,
  "custom_bitrate": undefined,
  "custom_fps": undefined
}
```

---

## Expected Gemini AI Response (Sample)

```json
{
  "top_products": [
    {
      "product_name": "AeroFlex AF-3264 NVR",
      "product_model": "AF-3264",
      "channel_capacity": "32-64 channels",
      "storage_capacity_tb": 72,
      "cpu": "Intel Core i7",
      "ram": "32GB DDR4",
      "raid_support": "RAID 0, 1, 5, 6, 10",
      "suitable_for": ["Medium to large businesses", "32-64 cameras", "Mid-range deployments"],
      "why_recommended": "The AF-3264 NVR is ideal for your 50-camera deployment requiring approximately 28.6 TB of storage. With 32-64 channel capacity, it can comfortably handle your camera count while providing room for future expansion. The 72 TB storage capacity exceeds your requirements, ensuring sufficient space for the 30-day retention period.",
      "key_benefits": ["VMS + Recording", "Workstation + Video Wall", "NVIDIA RTX 1000 4GB"],
      "rank": 1
    },
    {
      "product_name": "AeroFlex AF-64128 NVR",
      "product_model": "AF-64128",
      "channel_capacity": "64-128 channels",
      "storage_capacity_tb": 144,
      "cpu": "Intel Core i9",
      "ram": "64GB DDR4",
      "raid_support": "RAID 0, 1, 5, 6, 10",
      "suitable_for": ["Large enterprises", "64-128 cameras", "High-performance deployments"],
      "why_recommended": "The AF-64128 NVR provides excellent scalability for your 50-camera setup. While it offers more capacity than strictly necessary, it provides headroom for future expansion and enhanced performance with its Intel Core i9 processor and 64GB RAM.",
      "key_benefits": ["VMS + Recording", "Workstation + Video Wall", "NVIDIA RTX A2000 12GB"],
      "rank": 2
    }
  ],
  "calculations": {
    "total_storage_tb": 28.577,
    "daily_storage_tb": 0.794,
    "daily_storage_per_camera_gb": 15.876,
    "total_bitrate_mbps": 105.0,
    "bitrate_per_camera": 2.1,
    "retention_days": 30,
    "adjusted_bitrate": 2.1,
    "overhead_factor": 1.2
  },
  "optimization": {
    "suggestions": [
      "Consider implementing motion-based recording to reduce storage needs by up to 70%",
      "H.265 codec is already optimized - maintaining this will keep storage requirements low"
    ],
      "insights": [
        "Storage calculated using industry-standard bitrate tables for 1080p at 30 FPS",
        "With 70% activity level, continuous recording generates approximately 15.876 GB per camera per day",
        "The 20% overhead factor accounts for system metadata, indexing, and file system overhead"
      ]
  },
  "summary": "For your 50-camera deployment requiring 28.6 TB storage with 30-day retention, we recommend the AeroFlex AF-3264 NVR as the primary solution, with AF-64128 NVR as an alternative for enhanced scalability."
}
```

### Calculation Verification (for sample above):
- **Base Bitrate**: 1080p, 30fps, Medium = 3.5 Mbps (from table)
- **Compression**: H.265 = 3.5 × 0.6 = 2.1 Mbps
- **Daily Storage per Camera**: (2.1 × 3600 × 24) / 8 = 22,680 MB
- **With Activity (70%)**: 22,680 × 0.7 = 15,876 MB = 15.876 GB
- **For 30 days**: 15,876 × 30 = 476,280 MB per camera
- **For 50 cameras**: 476,280 × 50 = 23,814,000 MB
- **Convert to TB**: 23,814,000 / 1,000,000 = 23.814 TB
- **With 20% overhead**: 23.814 × 1.2 = **28.577 TB**

**Expected Correct Response**: The `total_storage_tb` should be approximately **28.577 TB** (not 2.84 TB). The prompt now includes a detailed calculation example to help Gemini calculate correctly.

---

## Parameter Validation Checklist

### ✅ Parameters Being Sent:
1. ✅ `cameras` - Number of cameras
2. ✅ `resolution` - Video resolution (720p, 1080p, 4MP, 4K, 8K)
3. ✅ `fps` - Frame rate (or custom_fps if provided)
4. ✅ `codec` - Compression codec (H.265, H.264, MJPEG)
5. ✅ `quality` - Video quality (Low, Medium, High)
6. ✅ `activity_percent` - Motion activity percentage (0-100)
7. ✅ `recording_hours_per_day` - Hours of recording per day (1-24)
8. ✅ `retention_days` - Retention period in days
9. ✅ `recording_mode` - continuous or motion
10. ✅ `pre_record_seconds` - Pre-record buffer (if motion mode)
11. ✅ `post_record_seconds` - Post-record buffer (if motion mode)
12. ✅ `custom_bitrate` - Custom bitrate override (if provided)
13. ✅ `custom_fps` - Custom FPS override (if provided)

### ⚠️ Potential Issues Found:

1. **Quality Parameter**: The prompt mentions "quality" but in the frontend, we're always sending "Medium" as default. The bitrate table uses quality, but if custom_bitrate is provided, quality is ignored. This is correct behavior.

2. **Motion Recording Calculation**: The formula for motion recording might need clarification in the prompt. The current formula is:
   ```
   adjusted_motion_percent = min(100, activity_percent * ((pre_record_seconds + 10 + post_record_seconds) / 10))
   ```
   This should be clearly explained.

3. **Daily Storage Calculation**: The formula uses MB, then converts to GB. Make sure Gemini understands:
   - daily_storage_mb = (adjusted_bitrate * 3600 * recording_hours_per_day) / 8
   - Then convert: daily_storage_per_camera_gb = daily_storage_with_activity / 1000

---

## Recommendations to Improve Prompt

1. **Add explicit calculation examples** in the prompt
2. **Clarify unit conversions** (MB to GB to TB)
3. **Add validation checks** for calculated values
4. **Request intermediate calculation steps** in response for verification

