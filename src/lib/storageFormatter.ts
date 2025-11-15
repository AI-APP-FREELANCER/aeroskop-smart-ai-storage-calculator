/**
 * Formats storage values to display in GB when < 1 TB, and TB when >= 1 TB
 * @param storageTB - Storage value in TB
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with appropriate unit (GB or TB)
 */
export function formatStorage(storageTB: number, decimals: number = 2): string {
  if (storageTB < 1) {
    // Convert to GB and display
    const storageGB = storageTB * 1000;
    return `${storageGB.toFixed(decimals)} GB`;
  } else {
    // Display in TB
    return `${storageTB.toFixed(decimals)} TB`;
  }
}

/**
 * Formats daily storage values (typically in TB, but may be small)
 * @param storageTB - Storage value in TB
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with appropriate unit (GB or TB)
 */
export function formatDailyStorage(storageTB: number, decimals: number = 2): string {
  return formatStorage(storageTB, decimals);
}

/**
 * Formats daily storage capacity to ALWAYS display in GB, even if > 1 TB
 * This is used for "Daily Storage Capacity" which should always be in GB per requirements
 * @param storageTB - Storage value in TB
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string always in GB
 */
export function formatDailyStorageAlwaysGB(storageTB: number, decimals: number = 2): string {
  // Always convert to GB, even if > 1 TB
  const storageGB = storageTB * 1024; // Convert TB to GB (using 1024 base)
  return `${storageGB.toFixed(decimals)} GB`;
}

