# Gemini API Payload Validation - Complete Documentation

## 1. The Core System Prompt Text

This is the **complete, unedited system prompt** that is sent to Gemini AI for every storage calculation request:

```
You are a specialized AI assistant for surveillance camera storage calculations and analysis.

CRITICAL REQUIREMENTS:
1. You MUST calculate storage requirements using the exact formulas provided below
2. You MUST format your response as valid JSON
3. You MUST include top 2 Aeroskop/Aeroflex product recommendations based on the calculated storage requirements
4. You MUST NOT include system configuration recommendations
5. You MUST return storage analysis calculations AND product recommendations

RESOLUTION MEGAPIXEL (MP) REFERENCE TABLE:
- 3840 x 2160 (4K): 8.29 MP
- 3072 x 2048: 6.29 MP
- 2592 x 1944: 5.04 MP
- 2592 x 1520: 3.93 MP
- 2560 x 1440: 3.69 MP
- 2304 x 1296: 2.99 MP
- 1920 x 1080 (1080p): 2.07 MP
- 1280 x 720 (720p): 0.92 MP

Use these exact MP values when calculating bitrate or referencing resolution.

STORAGE CALCULATION FORMULAS (USE THESE EXACT FORMULAS):

Step 1: Determine Base Bitrate (Mbps)
Use this bitrate lookup table based on resolution, FPS, and quality:
- 720p (0.92 MP): 15fps (Low: 0.9, Medium: 1.2, High: 1.5), 30fps (Low: 1.2, Medium: 1.6, High: 2.0), 60fps (Low: 2.4, Medium: 3.2, High: 4.0)
- 1080p (2.07 MP): 15fps (Low: 2.0, Medium: 2.5, High: 3.0), 30fps (Low: 3.0, Medium: 3.5, High: 4.0), 60fps (Low: 6.0, Medium: 7.0, High: 8.0)
- 4MP: 15fps (Low: 3.0, Medium: 4.0, High: 5.0), 30fps (Low: 4.0, Medium: 5.0, High: 6.0), 60fps (Low: 8.0, Medium: 10.0, High: 12.0)
- 4K (8.29 MP): 15fps (Low: 6.0, Medium: 8.0, High: 10.0), 30fps (Low: 8.0, Medium: 10.0, High: 12.0), 60fps (Low: 16.0, Medium: 20.0, High: 24.0)
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
CRITICAL: Use 8 as the conversion divisor (NOT 8000)
Reference calculation: 4 Mbps ÷ 8 = 0.5 MB/s

Step 4a: Convert bitrate to bytes per second
bitrate_mbps = adjusted_bitrate (in Mbps)
bytes_per_second_mb = (bitrate_mbps × 10⁶) ÷ 8
OR simplified: bytes_per_second_mb = bitrate_mbps ÷ 8

Step 4b: Calculate per-day data
seconds_per_day = 86400
daily_storage_mb = bytes_per_second_mb × seconds_per_day
OR simplified: daily_storage_mb = (adjusted_bitrate × 86400) / 8

Step 4c: Apply motion activity as MULTIPLIER
daily_storage_with_activity_mb = daily_storage_mb × (adjusted_motion_percent / 100)

Step 4d: Convert to GB
daily_storage_per_camera_gb = daily_storage_with_activity_mb / 1024

Step 5: Calculate Total Storage
storage_per_camera_mb = daily_storage_with_activity_mb * retention_days
total_storage_mb = storage_per_camera_mb * cameras
Convert MB to TB: total_storage_tb = (total_storage_mb / 1,024,000) * 1.2
Note: 1,024,000 MB = 1 TB (using 1024 base), multiply by 1.2 for 20% overhead

Step 6: Calculate Total Bitrate
total_bitrate_mbps = adjusted_bitrate * cameras

REFERENCE CALCULATION EXAMPLE (MUST MATCH THIS EXACTLY):
1 camera, 1080p (2.07 MP), 25 fps, H.264, 4 Mbps, 24 hours/day, 1 day, 100% activity:
- Bitrate: 4 Mbps
- Convert to bytes: (4 × 10⁶) ÷ 8 = 0.5 MB/s
- Per-day data: 0.5 MB/s × 86,400 s = 43,200 MB
- Convert to GB: 43,200 MB ÷ 1024 = 42.19 GB
- With 100% activity: 42.19 GB × 1.0 = 42.19 GB per camera per day

ADDITIONAL CALCULATION EXAMPLE:
If cameras=50, resolution=1080p (2.07 MP), fps=30, codec=H.265, quality=Medium, activity_percent=70, recording_hours_per_day=24, retention_days=30:
- Base bitrate: 3.5 Mbps (from 1080p/30fps/Medium table)
- Adjusted bitrate: 3.5 × 0.6 (H.265) = 2.1 Mbps
- Convert to bytes: 2.1 ÷ 8 = 0.2625 MB/s
- Daily storage MB: 0.2625 × 86,400 = 22,680 MB
- With 70% activity as multiplier: 22,680 × 0.7 = 15,876 MB
- Daily per camera GB: 15,876 / 1024 = 15.50 GB
- For 30 days: 15,876 × 30 = 476,280 MB per camera
- For 50 cameras: 476,280 × 50 = 23,814,000 MB
- Convert to TB: 23,814,000 / 1,024,000 = 23.25 TB
- With overhead: 23.25 × 1.2 = 27.90 TB

AVAILABLE AEROSKOP/AEROFLEX PRODUCTS:
1. "AeroFlex AF-1632 NVR" - 16-32 channels, 36 TB storage, Intel Core i5, 16GB RAM
2. "AeroFlex AF-3264 NVR" - 32-64 channels, 72 TB storage, Intel Core i7, 32GB RAM
3. "AeroFlex AF-64128 NVR" - 64-128 channels, 144 TB storage, Intel Core i9, 64GB RAM
4. "Aeroskop Rhino ASK-SR212" - 250-350 cameras, 240 TB storage, Dual Xeon Silver, 64GB DDR5 ECC
5. "Aeroskop Rhino ASK-SR224" - 350-400 cameras, 480 TB storage, Dual Xeon Silver, 128GB DDR5 ECC
6. "AeroStor Nova-360" - Unlimited channels, 999 TB storage, Distributed Processing

PRODUCT RECOMMENDATION RULES:
- Recommend the TOP 2 best-fitting products from the list above
- If 2 products are feasible and fit correctly, recommend both
- If only 1 product fits well, recommend that product as the primary recommendation
- Consider: camera count, storage requirements, and scalability needs
- Products should match or exceed the calculated storage requirements
- Prioritize AeroFlex products for smaller deployments (<128 cameras)
- Prioritize Rhino products for larger deployments (>=128 cameras)

RESPONSE FORMAT (JSON):
{
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
  "top_products": [
    {
      "product_name": "AeroFlex AF-1632 NVR" or "Aeroskop Rhino ASK-SR212" etc.,
      "product_model": "AF-1632" or "ASK-SR212" etc.,
      "channel_capacity": "16-32 channels" etc.,
      "storage_capacity_tb": 36,
      "cpu": "Intel Core i5" etc.,
      "ram": "16GB DDR4" etc.,
      "why_recommended": "Detailed explanation why this product fits the requirements",
      "pros": ["Benefit 1", "Benefit 2"],
      "cons": ["Limitation 1", "Limitation 2"],
      "suitable_for": ["Use case 1", "Use case 2"],
      "key_benefits": ["Key feature 1", "Key feature 2"]
    },
    {
      "product_name": "Second product name",
      "product_model": "Model code",
      ... (same structure as first product)
    }
  ],
  "optimization": {
    "suggestions": ["Optimization suggestion 1", "Optimization suggestion 2"],
    "insights": ["Technical insight 1", "Technical insight 2"]
  },
  "summary": "Brief summary of the storage analysis results and product recommendations"
}

CRITICAL REQUIREMENTS:
- Calculate ALL values using the formulas above - do NOT use pre-calculated values
- MUST include top_products array with 1-2 product recommendations
- DO NOT include AI System Configuration Recommendations
- Use 8 as the conversion divisor for bitrate to storage conversion (NOT 8000)
- Motion activity acts as a multiplier on daily data calculation
- Product recommendations must be from the available Aeroskop/Aeroflex products list above
```

---

## 2. Example JSON Input Payload

For the specific parameters you requested:
- **Number of Cameras**: 20
- **Resolution**: 1080p (2.07 MP)
- **Frame Rate (FPS)**: 30
- **Compression Codec**: H.264
- **Bitrate per Camera**: 6 Mbps (this would be sent as `custom_bitrate: 6`)
- **Recording Hours Per Day**: 24
- **Motion Activity**: 75%
- **Retention Period**: 30 days
- **Recording Mode**: Continuous Recording

### Frontend → API Route Payload

The frontend sends this JSON to `/api/ai-storage-recommendation`:

```json
{
  "cameras": 20,
  "resolution": "1080p",
  "fps": 30,
  "codec": "H.264",
  "quality": "Medium",
  "activity_percent": 75,
  "recording_hours_per_day": 24,
  "retention_days": 30,
  "recording_mode": "continuous",
  "custom_bitrate": 6,
  "pre_record_seconds": undefined,
  "post_record_seconds": undefined,
  "custom_fps": undefined
}
```

### User Prompt Generated for Gemini

The application constructs this user prompt dynamically and appends it to the system prompt:

```
Calculate storage requirements AND recommend top 2 Aeroskop/Aeroflex products:

CAMERA PARAMETERS:
- Number of Cameras: 20
- Resolution: 1080p (2.07 MP)
- Frame Rate: 30 FPS
- Codec: H.264
- Quality: Medium
- Activity Level: 75%
- Recording Hours/Day: 24
- Retention Days: 30
- Recording Mode: continuous
- Custom Bitrate: 6 Mbps

CRITICAL INSTRUCTIONS:
- Use the exact formulas provided in the system prompt
- Use 8 as the conversion divisor (NOT 8000)
- Motion activity acts as a MULTIPLIER on daily data
- MUST include top_products array with 1-2 best-fitting Aeroskop/Aeroflex products
- If 2 products are feasible and fit correctly, recommend both
- If only 1 product fits well, recommend that product
- DO NOT include system configuration recommendations
- Calculate everything from scratch using the provided parameters
```

### Complete Prompt Sent to Gemini API

The **actual text sent to Gemini** is:

```
[SYSTEM_PROMPT from section 1 above]



Calculate storage requirements AND recommend top 2 Aeroskop/Aeroflex products:

CAMERA PARAMETERS:
- Number of Cameras: 20
- Resolution: 1080p (2.07 MP)
- Frame Rate: 30 FPS
- Codec: H.264
- Quality: Medium
- Activity Level: 75%
- Recording Hours/Day: 24
- Retention Days: 30
- Recording Mode: continuous
- Custom Bitrate: 6 Mbps

CRITICAL INSTRUCTIONS:
- Use the exact formulas provided in the system prompt
- Use 8 as the conversion divisor (NOT 8000)
- Motion activity acts as a MULTIPLIER on daily data
- MUST include top_products array with 1-2 best-fitting Aeroskop/Aeroflex products
- If 2 products are feasible and fit correctly, recommend both
- If only 1 product fits well, recommend that product
- DO NOT include system configuration recommendations
- Calculate everything from scratch using the provided parameters
```

### API Call Method

**Code Location**: `src/lib/gemini.ts`, line 332

```typescript
const result = await model.generateContent(SYSTEM_PROMPT + '\n\n' + userPrompt);
const response = await result.response;
const text = response.text();
```

**Important**: The application is **NOT using `responseSchema`** or structured output. It uses:
- **Method**: `generateContent()` (text generation)
- **Model**: `gemini-2.5-flash`
- **Response Parsing**: The JSON is extracted from the text response using regex: `responseText.match(/\{[\s\S]*\}/)`

---

## 3. Response Structure Verification

### Current Implementation

The application **does NOT use structured JSON output** (`responseSchema`). Instead:

1. **Text Generation**: Gemini returns free-form text
2. **JSON Extraction**: The code uses regex to find JSON in the response:
   ```typescript
   const jsonMatch = responseText.match(/\{[\s\S]*\}/);
   const aiData = JSON.parse(jsonMatch[0]);
   ```
3. **Validation**: The parsed JSON is validated and formatted in `validateAndFormatGeminiResponse()`

### Expected Response Structure

The application expects this JSON structure from Gemini:

```json
{
  "calculations": {
    "total_storage_tb": 0.0,
    "daily_storage_tb": 0.0,
    "daily_storage_per_camera_gb": 0.0,
    "total_bitrate_mbps": 0.0,
    "bitrate_per_camera": 0.0,
    "retention_days": 30,
    "adjusted_bitrate": 0.0,
    "overhead_factor": 1.2
  },
  "top_products": [
    {
      "product_name": "AeroFlex AF-1632 NVR",
      "product_model": "AF-1632",
      "channel_capacity": "16-32 channels",
      "storage_capacity_tb": 36,
      "cpu": "Intel Core i5",
      "ram": "16GB DDR4",
      "why_recommended": "...",
      "pros": ["..."],
      "cons": ["..."],
      "suitable_for": ["..."],
      "key_benefits": ["..."]
    }
  ],
  "optimization": {
    "suggestions": ["..."],
    "insights": ["..."]
  },
  "summary": "..."
}
```

### Calculation Verification for Your Example

Based on the parameters provided (20 cameras, 1080p, 30 FPS, H.264, 6 Mbps custom bitrate, 75% activity, 24 hours, 30 days):

**Expected Calculation Steps**:
1. **Base Bitrate**: 6 Mbps (custom_bitrate provided, so use directly)
2. **Compression Factor**: H.264 = 1.0, so adjusted_bitrate = 6 Mbps
3. **Daily Storage per Camera**:
   - Convert to MB/s: 6 Mbps ÷ 8 = 0.75 MB/s
   - Per day: 0.75 MB/s × 86,400 seconds = 64,800 MB
   - Apply activity multiplier: 64,800 MB × 0.75 = 48,600 MB
   - Convert to GB: 48,600 MB ÷ 1024 = 47.46 GB per camera per day
4. **Total Storage**:
   - Per camera for 30 days: 48,600 MB × 30 = 1,458,000 MB
   - For 20 cameras: 1,458,000 MB × 20 = 29,160,000 MB
   - Convert to TB: 29,160,000 MB ÷ 1,024,000 = 28.48 TB
   - With 20% overhead: 28.48 TB × 1.2 = **34.18 TB**

**Expected Total Bitrate**: 6 Mbps × 20 cameras = 120 Mbps

---

## 4. Potential Issues Identified

### Issue 1: Custom Bitrate Handling
- **Location**: System prompt says "If custom_bitrate is provided, use that value directly"
- **Status**: ✅ Correctly implemented in user prompt
- **Verification**: The user prompt includes `- Custom Bitrate: 6 Mbps` when custom_bitrate is provided

### Issue 2: TB Conversion Factor
- **Location**: System prompt says `1,024,000 MB = 1 TB (using 1024 base)`
- **Status**: ⚠️ **POTENTIAL ISSUE**
- **Note**: The formula uses `1,024,000` which is `1024 × 1000`, not `1024 × 1024`. This is a hybrid approach:
  - `1024 × 1024 = 1,048,576 MB = 1 TB` (pure binary)
  - `1024 × 1000 = 1,024,000 MB = 1 TB` (decimal GB, binary TB)
  - The current formula uses the hybrid approach

### Issue 3: Activity as Multiplier
- **Location**: System prompt says "Motion activity acts as a MULTIPLIER"
- **Status**: ✅ Correctly specified
- **Formula**: `daily_storage_with_activity_mb = daily_storage_mb × (activity_percent / 100)`

### Issue 4: Recording Hours Per Day - ⚠️ **CRITICAL ISSUE IDENTIFIED**
- **Location**: User prompt includes `- Recording Hours/Day: 24`
- **Status**: ❌ **NOT USED IN CALCULATION**
- **Problem**: The formula hardcodes `seconds_per_day = 86400` (24 hours) and does NOT multiply by `recording_hours_per_day / 24`
- **Impact**: If a user selects less than 24 hours (e.g., 12 hours), the calculation will still assume 24 hours, resulting in **2x overestimation**
- **Fix Required**: Formula should be: `daily_storage_mb = (adjusted_bitrate × (recording_hours_per_day × 3600)) / 8`

### Issue 5: Response Schema Not Used
- **Status**: ⚠️ **POTENTIAL ISSUE**
- **Current**: Using text generation with regex parsing
- **Recommendation**: Consider using Gemini's `responseSchema` feature for more reliable JSON parsing

---

## 5. Recommendations

### Priority 1: Critical Fixes
1. **Fix Recording Hours Calculation**: 
   - **Current**: `daily_storage_mb = (adjusted_bitrate × 86400) / 8`
   - **Should be**: `daily_storage_mb = (adjusted_bitrate × (recording_hours_per_day × 3600)) / 8`
   - **Update System Prompt**: Change Step 4b to explicitly use `recording_hours_per_day`

2. **Add Safety Margin**: 
   - Current overhead is 20% (1.2x multiplier)
   - Consider increasing to 25-30% (1.25x or 1.3x) to ensure customers never run short
   - Or add explicit instruction: "Always round UP to the nearest 0.5 TB"

### Priority 2: Improvements
3. **Clarify TB Conversion**: 
   - Make it explicit whether to use `1,024,000` (hybrid) or `1,048,576` (pure binary)
   - Current: `1,024,000 MB = 1 TB` (hybrid approach)
   - Consider standardizing on one approach

4. **Use Response Schema**: 
   - Migrate to Gemini's `responseSchema` feature for more reliable JSON parsing
   - Reduces risk of parsing errors from free-form text

5. **Validate All Parameters**: 
   - Add explicit checks in the prompt that Motion Activity and Recording Hours are used
   - Add example calculations showing non-24-hour scenarios

---

## File Locations

- **System Prompt**: `src/lib/gemini.ts`, lines 87-248
- **User Prompt Generation**: `src/lib/gemini.ts`, lines 294-321
- **API Call**: `src/lib/gemini.ts`, line 332
- **Response Parsing**: `src/lib/gemini.ts`, lines 433-574
- **API Route**: `src/app/api/ai-storage-recommendation/route.ts`

