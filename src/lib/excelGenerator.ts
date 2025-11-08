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

export async function generateExcelReport(data: ExportData): Promise<string> {
  // Dynamic import for xlsx to work with Next.js client components
  const XLSXModule = await import('xlsx');
  const XLSX = XLSXModule.default || XLSXModule;
  const workbook = XLSX.utils.book_new();

  // Worksheet 1: Input Parameters
  const inputParams = [
    ['Parameter', 'Value'],
    ['Number of Cameras', data.formData.cameras],
    ['Resolution', data.formData.resolution],
    ['Frame Rate (FPS)', data.formData.customFps || data.formData.fps],
    ['Compression Codec', data.formData.codec],
    ['Bitrate (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)],
    ['Recording Hours Per Day', data.formData.recordingHoursPerDay],
    ['Motion Activity (%)', data.formData.activityPercent],
    ['Retention Period (Days)', data.formData.retentionDays],
    ['Recording Mode', data.formData.recordingMode || 'continuous'],
    ['Pre-Record Time (seconds)', data.formData.preRecordSeconds || 2],
    ['Post-Record Time (seconds)', data.formData.postRecordSeconds || 5],
    ['Number of Servers', data.formData.numberOfServers || 'N/A'],
    ['RAID Type', data.formData.raidType || 'N/A'],
    ['HDDs per Server', data.formData.hddPerServer || 'N/A'],
    ['Drive Capacity (TB)', data.formData.driveCapacityTB || 'N/A'],
    ['Server Model', data.formData.serverModel || 'N/A']
  ];
  
  const inputSheet = XLSX.utils.aoa_to_sheet(inputParams);
  XLSX.utils.book_append_sheet(workbook, inputSheet, 'Input Parameters');

  // Worksheet 2: Calculation Summary
  const calculations = [
    ['Metric', 'Value'],
    ['Total Storage Required (TB)', data.calculationResult.totalStorageTB.toFixed(2)],
    ['Daily Storage (TB)', (data.calculationResult.totalStorageTB / data.formData.retentionDays).toFixed(2)],
    ['Daily Storage per Camera (GB)', data.calculationResult.dailyStoragePerCameraGB.toFixed(2)],
    ['Total Bitrate (Mbps)', data.calculationResult.totalBitrateMbps.toFixed(2)],
    ['Bitrate per Camera (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)],
    ['Adjusted Bitrate (Mbps)', data.calculationResult.adjustedBitrate.toFixed(2)],
    ['System Overhead Factor', `${data.calculationResult.overhead}x`],
    ['Adjusted Motion %', data.calculationResult.adjustedMotionPercent?.toFixed(2) || data.formData.activityPercent],
    ['Retention Days', data.formData.retentionDays]
  ];
  
  const calcSheet = XLSX.utils.aoa_to_sheet(calculations);
  XLSX.utils.book_append_sheet(workbook, calcSheet, 'Calculation Summary');

  // Worksheet 3: Storage Requirements
  const storageReqs = [
    ['Metric', 'Value', 'Description'],
    ['Usable Storage (TB)', data.raidInfo ? data.raidInfo.usableCapacityTB.toFixed(2) : data.calculationResult.totalStorageTB.toFixed(2), 'Total space available after RAID overhead'],
    ['Raw Capacity Needed (TB)', data.raidInfo ? data.raidInfo.rawCapacityTB.toFixed(2) : (data.calculationResult.totalStorageTB * 1.5).toFixed(2), 'Total disk capacity required before redundancy'],
    ['RAID Overhead', data.raidInfo ? `${data.raidInfo.overheadPercent.toFixed(1)}%` : 'N/A', data.raidInfo ? `Automatically calculated for ${data.formData.raidType}` : 'No RAID configured'],
    ['Retention Days', data.formData.retentionDays.toString(), 'Duration for which recordings are stored'],
    ['Average Motion % (Adjusted)', (data.calculationResult.adjustedMotionPercent || data.formData.activityPercent).toFixed(1), 'After applying pre/post detection intervals']
  ];
  
  const storageSheet = XLSX.utils.aoa_to_sheet(storageReqs);
  XLSX.utils.book_append_sheet(workbook, storageSheet, 'Storage Requirements');

  // Worksheet 4: RAID/ZFS Protection Details
  if (data.raidInfo && data.formData.raidType) {
    const raidDetails = [
      ['Parameter', 'Value'],
      ['RAID Type', data.formData.raidType],
      ['Number of Servers', (data.formData.numberOfServers || 1).toString()],
      ['HDDs per Server', (data.formData.hddPerServer || 0).toString()],
      ['Total HDDs', ((data.formData.numberOfServers || 1) * (data.formData.hddPerServer || 0)).toString()],
      ['Drive Capacity (TB)', (data.formData.driveCapacityTB || 0).toString()],
      ['Raw Capacity (TB)', data.raidInfo.rawCapacityTB.toFixed(2)],
      ['Usable Capacity (TB)', data.raidInfo.usableCapacityTB.toFixed(2)],
      ['RAID Overhead (%)', data.raidInfo.overheadPercent.toFixed(1)],
      ['RAID Overhead (TB)', data.raidInfo.overheadTB.toFixed(2)]
    ];
    
    const raidSheet = XLSX.utils.aoa_to_sheet(raidDetails);
    XLSX.utils.book_append_sheet(workbook, raidSheet, 'RAID Details');
  }

  // Worksheet 5: Server Configuration Recommendations
  if (data.serverRecommendations) {
    const serverRecs = [
      ['Parameter', 'Recommendation'],
      ['Number of Servers', data.serverRecommendations.numberOfServers.toString()],
      ['Drives per Server', data.serverRecommendations.drivesPerServer.toString()],
      ['Drive Type', data.serverRecommendations.driveType],
      ['Network', data.serverRecommendations.network],
      ['CPU', data.serverRecommendations.cpu],
      ['Memory', data.serverRecommendations.memory],
      ['OS/Filesystem', data.serverRecommendations.osFilesystem],
      ['', ''],
      ['Rationale', '']
    ];
    
    // Add rationale items
    data.serverRecommendations.rationale.forEach((item, index) => {
      serverRecs.push([`${index + 1}.`, item]);
    });
    
    const serverSheet = XLSX.utils.aoa_to_sheet(serverRecs);
    XLSX.utils.book_append_sheet(workbook, serverSheet, 'Server Recommendations');
  }

  // Worksheet 6: Disclaimer
  const disclaimerRows = DISCLAIMER_TEXT.split('\n').map(line => [line]);
  const disclaimerSheet = XLSX.utils.aoa_to_sheet(disclaimerRows);
  XLSX.utils.book_append_sheet(workbook, disclaimerSheet, 'Disclaimer');

  // Generate filename and download
  const fileName = `aeroskop-storage-calculation-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return fileName;
}

