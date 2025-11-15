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

// RAID overhead calculation
export function calculateRAIDOverhead(
  raidType: 'RAID-1' | 'RAID-5' | 'RAID-6' | 'RAID-Z1' | 'RAID-Z2',
  totalHDDs: number,
  driveCapacityTB: number
): {
  rawCapacityTB: number;
  usableCapacityTB: number;
  overheadPercent: number;
  overheadTB: number;
} {
  const rawCapacityTB = totalHDDs * driveCapacityTB;
  
  let overheadPercent: number;
  let usableCapacityTB: number;
  
  switch (raidType) {
    case 'RAID-1':
      // Mirroring: 50% overhead
      overheadPercent = 50;
      usableCapacityTB = rawCapacityTB * 0.5;
      break;
    case 'RAID-5':
      // Single parity: ~33% overhead (1 drive out of n)
      overheadPercent = (1 / totalHDDs) * 100;
      usableCapacityTB = rawCapacityTB * (1 - 1 / totalHDDs);
      break;
    case 'RAID-6':
      // Dual parity: ~50% overhead (2 drives out of n, minimum 4 drives)
      overheadPercent = totalHDDs >= 4 ? (2 / totalHDDs) * 100 : 50;
      usableCapacityTB = totalHDDs >= 4 ? rawCapacityTB * (1 - 2 / totalHDDs) : rawCapacityTB * 0.5;
      break;
    case 'RAID-Z1':
      // ZFS single parity: ~33% overhead
      overheadPercent = (1 / totalHDDs) * 100;
      usableCapacityTB = rawCapacityTB * (1 - 1 / totalHDDs);
      break;
    case 'RAID-Z2':
      // ZFS dual parity: ~50% overhead (minimum 3 drives)
      overheadPercent = totalHDDs >= 3 ? (2 / totalHDDs) * 100 : 50;
      usableCapacityTB = totalHDDs >= 3 ? rawCapacityTB * (1 - 2 / totalHDDs) : rawCapacityTB * 0.5;
      break;
    default:
      overheadPercent = 0;
      usableCapacityTB = rawCapacityTB;
  }
  
  return {
    rawCapacityTB,
    usableCapacityTB,
    overheadPercent,
    overheadTB: rawCapacityTB - usableCapacityTB
  };
}

// Calculate usable capacity from raw capacity and RAID type
export function calculateUsableCapacity(
  rawCapacityTB: number,
  raidType: 'RAID-1' | 'RAID-5' | 'RAID-6' | 'RAID-Z1' | 'RAID-Z2',
  totalHDDs: number = 6
): number {
  const raidCalc = calculateRAIDOverhead(raidType, totalHDDs, rawCapacityTB / totalHDDs);
  return raidCalc.usableCapacityTB;
}

// Enhanced storage calculation with all new features
export function calculateAccurateStorage(input: {
  cameras: number;
  resolution: string;
  fps: number;
  codec: string;
  quality: string;
  recordingHoursPerDay: number;
  activityPercent: number;
  retentionDays: number;
  // New optional parameters
  customBitrate?: number;
  customFps?: number;
  preRecordSeconds?: number;
  postRecordSeconds?: number;
  recordingMode?: string;
}): {
  bitratePerCamera: number;
  dailyStoragePerCameraGB: number;
  totalStorageTB: number;
  totalBitrateMbps: number;
  adjustedBitrate: number;
  overhead: number;
  adjustedMotionPercent?: number;
} {
  // Step 1: Determine base bitrate
  let baseBitrate: number;
  
  // Priority 1: Use custom bitrate from slider if explicitly provided
  if (input.customBitrate !== undefined && input.customBitrate > 0) {
    baseBitrate = input.customBitrate;
  } else {
    // Priority 2: Use quality lookup table
    // If custom FPS is provided, scale from 30 FPS base
    let lookupFps = input.fps;
    if (input.customFps && input.customFps > 0) {
      lookupFps = 30; // Use 30 FPS as base for scaling
    }
    
    baseBitrate = BASE_BITRATE_TABLE[input.resolution]?.[lookupFps]?.[input.quality] || 4.0;
    
    // Apply FPS scaling if custom FPS is provided
    if (input.customFps && input.customFps > 0) {
      baseBitrate = baseBitrate * (input.customFps / 30);
    } else if (input.fps !== 30) {
      // Scale based on actual FPS vs 30 FPS
      baseBitrate = baseBitrate * (input.fps / 30);
    }
  }
  
  // Step 2: Apply compression adjustment
  const compressionFactor = {
    'H.265': 0.6,
    'H.264': 1.0,
    'MJPEG': 4.0
  }[input.codec] || 1.0;
  
  const adjustedBitrate = baseBitrate * compressionFactor;
  
  // Step 3: Handle motion-triggered recording
  let adjustedMotionPercent = input.activityPercent;
  if (input.recordingMode === 'motion' && input.preRecordSeconds !== undefined && input.postRecordSeconds !== undefined) {
    // Calculate effective recording percentage
    // Pre-record and post-record times extend the recording duration
    // Assume average motion event duration of 10 seconds
    const avgMotionEventDuration = 10;
    const preRecord = input.preRecordSeconds || 2;
    const postRecord = input.postRecordSeconds || 5;
    const totalRecordTime = preRecord + avgMotionEventDuration + postRecord;
    
    // Calculate effective percentage: activity% * (total record time / motion event duration)
    // This accounts for the extended recording time due to pre/post-record
    const timeMultiplier = totalRecordTime / avgMotionEventDuration;
    const effectivePercent = Math.min(100, input.activityPercent * timeMultiplier);
    adjustedMotionPercent = effectivePercent;
  }
  
  // Step 4: Calculate daily storage per camera (MB)
  // Daily = (bitrate × 3600 × recording_hours) / 8
  const dailyStorageMB = (adjustedBitrate * 3600 * input.recordingHoursPerDay) / 8;
  
  // Step 5: Apply activity ratio (adjusted for motion recording)
  const activityRatio = adjustedMotionPercent / 100;
  const dailyWithActivity = dailyStorageMB * activityRatio;
  
  // Step 6: Calculate per camera for retention period
  const storagePerCameraMB = dailyWithActivity * input.retentionDays;
  
  // Step 7: Multiply by camera count
  const totalStorageMB = storagePerCameraMB * input.cameras;
  
  // Step 8: Convert to TB and add 20% overhead
  const totalStorageTB = (totalStorageMB / 1_000_000) * 1.2;
  
  return {
    bitratePerCamera: adjustedBitrate,
    dailyStoragePerCameraGB: dailyWithActivity / 1000,
    totalStorageTB: totalStorageTB,
    totalBitrateMbps: adjustedBitrate * input.cameras,
    adjustedBitrate: adjustedBitrate,
    overhead: 1.2,
    adjustedMotionPercent: input.recordingMode === 'motion' ? adjustedMotionPercent : undefined
  };
}
