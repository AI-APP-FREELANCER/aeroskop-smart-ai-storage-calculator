import { EnhancedStorageCalculation, ServerRecommendation, CalculatorForm } from './types';
import { calculateRAIDOverhead } from './storageCalculations';

const DISCLAIMER_TEXT = `Disclaimer:
The results provided by this calculator are approximate estimations intended for planning and reference purposes only.
Actual storage requirements may vary based on codec efficiency, scene complexity, motion levels, network performance, and recording configurations.
Users are advised to verify the results through real-world testing and consult their storage vendor before final implementation.
Aeroskop Technologies and its affiliates shall not be held responsible for discrepancies arising from these estimations.`;

interface ExportData {
  formData: CalculatorForm;
  calculationResult: EnhancedStorageCalculation;
  serverRecommendations?: ServerRecommendation;
  raidInfo?: {
    rawCapacityTB: number;
    usableCapacityTB: number;
    overheadPercent: number;
    overheadTB: number;
  };
}

// Helper to escape CSV fields
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }
  const str = String(field);
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper to create CSV row
function createCSVRow(values: any[]): string {
  return values.map(escapeCSVField).join(',');
}

export async function generateCSVReport(data: ExportData): Promise<string> {
  const rows: string[] = [];
  
  // Header
  rows.push('AI Surveillance Storage Calculator - Aeroskop Technologies');
  rows.push(`Generated on: ${new Date().toLocaleDateString()}`);
  rows.push('');
  
  // Section 1: Input Parameters
  rows.push('=== INPUT PARAMETERS ===');
  rows.push(createCSVRow(['Parameter', 'Value']));
  rows.push(createCSVRow(['Number of Cameras', data.formData.cameras]));
  rows.push(createCSVRow(['Resolution', data.formData.resolution]));
  rows.push(createCSVRow(['Frame Rate (FPS)', data.formData.customFps || data.formData.fps]));
  rows.push(createCSVRow(['Compression Codec', data.formData.codec]));
  rows.push(createCSVRow(['Bitrate (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)]));
  rows.push(createCSVRow(['Recording Hours Per Day', data.formData.recordingHoursPerDay]));
  rows.push(createCSVRow(['Motion Activity (%)', data.formData.activityPercent]));
  rows.push(createCSVRow(['Retention Period (Days)', data.formData.retentionDays]));
  rows.push(createCSVRow(['Recording Mode', data.formData.recordingMode || 'continuous']));
  rows.push(createCSVRow(['Pre-Record Time (seconds)', data.formData.preRecordSeconds || 2]));
  rows.push(createCSVRow(['Post-Record Time (seconds)', data.formData.postRecordSeconds || 5]));
  rows.push(createCSVRow(['Number of Servers', data.formData.numberOfServers || 'N/A']));
  rows.push(createCSVRow(['HDDs per Server', data.formData.hddPerServer || 'N/A']));
  rows.push(createCSVRow(['Drive Capacity (TB)', data.formData.driveCapacityTB || 'N/A']));
  rows.push(createCSVRow(['Server Model', data.formData.serverModel || 'N/A']));
  rows.push('');
  
  // Section 2: Calculation Summary
  rows.push('=== CALCULATION SUMMARY ===');
  rows.push(createCSVRow(['Metric', 'Value']));
  rows.push(createCSVRow(['Total Storage Required (TB)', data.calculationResult.totalStorageTB.toFixed(2)]));
  rows.push(createCSVRow(['Daily Storage (TB)', (data.calculationResult.totalStorageTB / data.formData.retentionDays).toFixed(2)]));
  rows.push(createCSVRow(['Daily Storage per Camera (GB)', data.calculationResult.dailyStoragePerCameraGB.toFixed(2)]));
  rows.push(createCSVRow(['Total Bitrate (Mbps)', data.calculationResult.totalBitrateMbps.toFixed(2)]));
  rows.push(createCSVRow(['Bitrate per Camera (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)]));
  rows.push(createCSVRow(['Adjusted Bitrate (Mbps)', data.calculationResult.adjustedBitrate.toFixed(2)]));
  rows.push(createCSVRow(['System Overhead Factor', `${data.calculationResult.overhead}x`]));
  rows.push(createCSVRow(['Adjusted Motion %', (data.calculationResult.adjustedMotionPercent || data.formData.activityPercent).toFixed(2)]));
  rows.push('');
  
  // Section 3: Storage Requirements
  rows.push('=== STORAGE REQUIREMENTS ===');
  rows.push(createCSVRow(['Metric', 'Value', 'Description']));
  rows.push(createCSVRow([
    'Usable Storage (TB)',
    data.raidInfo ? data.raidInfo.usableCapacityTB.toFixed(2) : data.calculationResult.totalStorageTB.toFixed(2),
    'Total space available after RAID overhead'
  ]));
  rows.push(createCSVRow([
    'Raw Capacity Needed (TB)',
    data.raidInfo ? data.raidInfo.rawCapacityTB.toFixed(2) : (data.calculationResult.totalStorageTB * 1.5).toFixed(2),
    'Total disk capacity required before redundancy'
  ]));
  rows.push(createCSVRow([
    'RAID Overhead',
    data.raidInfo ? `${data.raidInfo.overheadPercent.toFixed(1)}%` : 'N/A',
    data.raidInfo ? 'Automatically calculated' : 'No RAID configured'
  ]));
  rows.push(createCSVRow(['Retention Days', data.formData.retentionDays.toString(), 'Duration for which recordings are stored']));
  rows.push(createCSVRow([
    'Average Motion % (Adjusted)',
    (data.calculationResult.adjustedMotionPercent || data.formData.activityPercent).toFixed(1),
    'After applying pre/post detection intervals'
  ]));
  rows.push('');
  
  // Section 4: RAID/ZFS Protection Details (if applicable)
  if (data.raidInfo) {
    rows.push('=== RAID/ZFS PROTECTION DETAILS ===');
    rows.push(createCSVRow(['Parameter', 'Value']));
    rows.push(createCSVRow(['Number of Servers', (data.formData.numberOfServers || 1).toString()]));
    rows.push(createCSVRow(['HDDs per Server', (data.formData.hddPerServer || 0).toString()]));
    rows.push(createCSVRow(['Total HDDs', ((data.formData.numberOfServers || 1) * (data.formData.hddPerServer || 0)).toString()]));
    rows.push(createCSVRow(['Drive Capacity (TB)', (data.formData.driveCapacityTB || 0).toString()]));
    rows.push(createCSVRow(['Raw Capacity (TB)', data.raidInfo.rawCapacityTB.toFixed(2)]));
    rows.push(createCSVRow(['Usable Capacity (TB)', data.raidInfo.usableCapacityTB.toFixed(2)]));
    rows.push(createCSVRow(['RAID Overhead (%)', data.raidInfo.overheadPercent.toFixed(1)]));
    rows.push(createCSVRow(['RAID Overhead (TB)', data.raidInfo.overheadTB.toFixed(2)]));
    rows.push('');
  }
  
  // Section 5: Server Configuration Recommendations (if available)
  if (data.serverRecommendations) {
    rows.push('=== SERVER CONFIGURATION RECOMMENDATIONS ===');
    rows.push(createCSVRow(['Parameter', 'Recommendation']));
    rows.push(createCSVRow(['Number of Servers', data.serverRecommendations.numberOfServers.toString()]));
    rows.push(createCSVRow(['Drives per Server', data.serverRecommendations.drivesPerServer.toString()]));
    rows.push(createCSVRow(['Drive Type', data.serverRecommendations.driveType]));
    rows.push(createCSVRow(['Network', data.serverRecommendations.network]));
    rows.push(createCSVRow(['CPU', data.serverRecommendations.cpu]));
    rows.push(createCSVRow(['Memory', data.serverRecommendations.memory]));
    rows.push(createCSVRow(['OS/Filesystem', data.serverRecommendations.osFilesystem]));
    rows.push('');
    rows.push('Rationale:');
    data.serverRecommendations.rationale.forEach((item) => {
      rows.push(createCSVRow([item]));
    });
    rows.push('');
  }
  
  // Section 6: Disclaimer
  rows.push('=== DISCLAIMER ===');
  DISCLAIMER_TEXT.split('\n').forEach(line => {
    rows.push(createCSVRow([line]));
  });
  
  // Join all rows
  const csvContent = rows.join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const fileName = `aeroskop-storage-calculation-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return fileName;
}

