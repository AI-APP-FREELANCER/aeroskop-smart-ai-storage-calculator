// Professional-grade storage calculation utilities
// This file contains only calculation logic without OpenAI dependencies

// Comprehensive bitrate lookup table based on industry surveillance standards
export const BASE_BITRATE_TABLE: Record<string, Record<number, Record<string, number>>> = {
  '720p': {
    15: { 'Medium': 1.2, 'High': 1.5, 'Low': 0.9 },
    30: { 'Medium': 1.6, 'High': 2.0, 'Low': 1.2 },
    60: { 'Medium': 3.2, 'High': 4.0, 'Low': 2.4 }
  },
  '1080p': {
    15: { 'Medium': 2.5, 'High': 3.0, 'Low': 2.0 },
    30: { 'Medium': 3.5, 'High': 4.0, 'Low': 3.0 },
    60: { 'Medium': 7.0, 'High': 8.0, 'Low': 6.0 }
  },
  '4MP': {
    15: { 'Medium': 4.0, 'High': 5.0, 'Low': 3.0 },
    30: { 'Medium': 5.0, 'High': 6.0, 'Low': 4.0 },
    60: { 'Medium': 10.0, 'High': 12.0, 'Low': 8.0 }
  },
  '4K': {
    15: { 'Medium': 8.0, 'High': 10.0, 'Low': 6.0 },
    30: { 'Medium': 10.0, 'High': 12.0, 'Low': 8.0 },
    60: { 'Medium': 20.0, 'High': 24.0, 'Low': 16.0 }
  },
  '8K': {
    15: { 'Medium': 25.0, 'High': 30.0, 'Low': 20.0 },
    30: { 'Medium': 40.0, 'High': 50.0, 'Low': 30.0 },
    60: { 'Medium': 80.0, 'High': 100.0, 'Low': 60.0 }
  }
};

// Professional-grade storage calculation based on industry VMS standards
export function calculateAccurateStorage(input: {
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  quality: string;
  recordingHoursPerDay: number;
  activityPercent: number;
  retentionDays: number;
}): {
  bitratePerCamera: number;
  dailyStoragePerCameraGB: number;
  totalStorageTB: number;
  totalBitrateMbps: number;
  adjustedBitrate: number;
  overhead: number;
} {
  // Step 1: Get base bitrate from industry standards table
  const baseBitrate = BASE_BITRATE_TABLE[input.resolution]?.[input.fps]?.[input.quality] || 4.0;
  
  // Step 2: Apply compression adjustment
  const compressionFactor = {
    'H.265': 0.6,
    'H.264': 1.0,
    'H.264+': 0.5,
    'MJPEG': 4.0
  }[input.codec] || 1.0;
  
  const adjustedBitrate = baseBitrate * compressionFactor;
  
  // Step 3: Calculate daily storage per camera (MB)
  // Daily = (bitrate × 3600 × recording_hours) / 8
  const dailyStorageMB = (adjustedBitrate * 3600 * input.recordingHoursPerDay) / 8;
  
  // Step 4: Apply activity ratio
  const activityRatio = input.activityPercent / 100;
  const dailyWithActivity = dailyStorageMB * activityRatio;
  
  // Step 5: Calculate per camera for retention period
  const storagePerCameraMB = dailyWithActivity * input.retentionDays;
  
  // Step 6: Multiply by camera count
  const totalStorageMB = storagePerCameraMB * input.cameras;
  
  // Step 7: Convert to TB and add 20% overhead
  const totalStorageTB = (totalStorageMB / 1_000_000) * 1.2;
  
  return {
    bitratePerCamera: adjustedBitrate,
    dailyStoragePerCameraGB: dailyWithActivity / 1000,
    totalStorageTB: totalStorageTB,
    totalBitrateMbps: adjustedBitrate * input.cameras,
    adjustedBitrate: adjustedBitrate,
    overhead: 1.2
  };
}
