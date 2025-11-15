import { EnhancedStorageCalculation, ServerRecommendation, CalculatorForm } from './types';

// Dynamic import for client-side usage
let jsPDF: any;
let autoTableFn: any = null;

async function loadPDFLibraries() {
  if (!jsPDF) {
    // Import jsPDF first
    jsPDF = (await import('jspdf')).default;
    
    // Import jspdf-autotable
    const autoTableModule = await import('jspdf-autotable');
    
    // Extract the autoTable function
    // jspdf-autotable v5 exports a function that takes (doc, options)
    autoTableFn = autoTableModule.default || autoTableModule.autoTable || autoTableModule;
    
    // Attach autoTable to jsPDF prototype for all instances
    if (typeof autoTableFn === 'function') {
      (jsPDF.prototype as any).autoTable = function(options: any) {
        return autoTableFn(this, options);
      };
    }
  }
  return { jsPDF, autoTableFn };
}

const DISCLAIMER_TEXT = `Disclaimer:
The results provided by this calculator are approximate estimations intended for planning and reference purposes only.
Actual storage requirements may vary based on codec efficiency, scene complexity, motion levels, network performance, and recording configurations.
Users are advised to verify the results through real-world testing and consult their storage vendor before final implementation.
Aeroskop Technologies and its affiliates shall not be held responsible for discrepancies arising from these estimations.`;

interface EnhancedExportData {
  formData: CalculatorForm;
  calculationResult: EnhancedStorageCalculation;
  serverRecommendations?: ServerRecommendation;
}

// Enhanced PDF generator for new calculator format
export async function generateEnhancedPDFReport(data: EnhancedExportData): Promise<string> {
  const { jsPDF: jsPDFLib, autoTableFn: autoTable } = await loadPDFLibraries();
  const doc = new jsPDFLib() as any;
  
  // Ensure autoTable is attached to this instance
  if (!doc.autoTable && autoTable && typeof autoTable === 'function') {
    doc.autoTable = function(options: any) {
      return autoTable(doc, options);
    };
  }
  
  // Helper to call autoTable
  const callAutoTable = (options: any) => {
    if (doc.autoTable && typeof doc.autoTable === 'function') {
      return doc.autoTable(options);
    } else if (autoTable && typeof autoTable === 'function') {
      return autoTable(doc, options);
    } else {
      throw new Error('autoTable is not available. Please ensure jspdf-autotable is properly installed.');
    }
  };
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue-500
  const accentColor = [16, 185, 129]; // Emerald-500
  
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Surveillance Storage Calculator', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`© 2025 Aeroskop Technologies | Generated on: ${new Date().toLocaleDateString()}`, 20, 25);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  let yPosition = 45;
  
  // Section 1: Input Parameters
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Input Parameters', 20, yPosition);
  yPosition += 8;
  
  const inputParams = [
    ['Parameter', 'Value'],
    ['Number of Cameras', data.formData.cameras.toString()],
    ['Resolution', data.formData.resolution],
    ['Frame Rate (FPS)', (data.formData.customFps || data.formData.fps).toString()],
    ['Compression Codec', data.formData.codec],
    ['Bitrate (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)],
    ['Recording Hours Per Day', data.formData.recordingHoursPerDay.toString()],
    ['Motion Activity (%)', data.formData.activityPercent.toString()],
    ['Retention Period (Days)', data.formData.retentionDays.toString()],
    ['Recording Mode', data.formData.recordingMode || 'continuous'],
    ['Pre-Record Time (seconds)', (data.formData.preRecordSeconds || 2).toString()],
    ['Post-Record Time (seconds)', (data.formData.postRecordSeconds || 5).toString()],
    ['Number of Servers', (data.formData.numberOfServers || 'N/A').toString()],
    ['HDDs per Server', (data.formData.hddPerServer || 'N/A').toString()],
    ['Drive Capacity (TB)', (data.formData.driveCapacityTB || 'N/A').toString()],
    ['Server Model', data.formData.serverModel || 'N/A']
  ];
  
  callAutoTable({
    startY: yPosition,
    head: [inputParams[0]],
    body: inputParams.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 90 } },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPosition + 50;
  
  // Check if we need a new page
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Section 2: Calculation Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Calculation Summary', 20, yPosition);
  yPosition += 8;
  
  const calcData = [
    ['Metric', 'Value'],
    ['Total Storage Required (TB)', data.calculationResult.totalStorageTB.toFixed(2)],
    ['Daily Storage (TB)', (data.calculationResult.totalStorageTB / data.formData.retentionDays).toFixed(2)],
    ['Daily Storage per Camera (GB)', data.calculationResult.dailyStoragePerCameraGB.toFixed(2)],
    ['Total Bitrate (Mbps)', data.calculationResult.totalBitrateMbps.toFixed(2)],
    ['Bitrate per Camera (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)],
    ['Adjusted Bitrate (Mbps)', data.calculationResult.adjustedBitrate.toFixed(2)],
    ['System Overhead Factor', `${data.calculationResult.overhead}x`],
    ['Adjusted Motion %', (data.calculationResult.adjustedMotionPercent || data.formData.activityPercent).toFixed(2)],
    ['Retention Days', data.formData.retentionDays.toString()]
  ];
  
  callAutoTable({
    startY: yPosition,
    head: [calcData[0]],
    body: calcData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 90 } },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPosition + 50;
  
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Section 3: Storage Requirements
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Storage Requirements', 20, yPosition);
  yPosition += 8;
  
  const storageData = [
    ['Metric', 'Value', 'Description'],
    [
      'Total Storage Required (TB)',
      data.calculationResult.totalStorageTB.toFixed(2),
      'Total storage space required including 20% overhead'
    ],
    ['Retention Days', data.formData.retentionDays.toString(), 'Duration for which recordings are stored'],
    [
      'Average Motion % (Adjusted)',
      (data.calculationResult.adjustedMotionPercent || data.formData.activityPercent).toFixed(1),
      'After applying pre/post detection intervals'
    ]
  ];
  
  callAutoTable({
    startY: yPosition,
    head: [storageData[0]],
    body: storageData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 40 }, 2: { cellWidth: 80 } },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPosition + 50;
  
  if (yPosition > 270) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Section 4: Server Configuration Recommendations (if available)
  if (data.serverRecommendations) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Server Configuration Recommendations', 20, yPosition);
    yPosition += 8;
    
    const serverData = [
      ['Parameter', 'Recommendation'],
      ['Number of Servers', data.serverRecommendations.numberOfServers.toString()],
      ['Drives per Server', data.serverRecommendations.drivesPerServer.toString()],
      ['Drive Type', data.serverRecommendations.driveType],
      ['Network', data.serverRecommendations.network],
      ['CPU', data.serverRecommendations.cpu],
      ['Memory', data.serverRecommendations.memory],
      ['OS/Filesystem', data.serverRecommendations.osFilesystem]
    ];
    
    callAutoTable({
      startY: yPosition,
      head: [serverData[0]],
      body: serverData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 90 } },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : yPosition + 50;
    
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Rationale
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Rationale:', 20, yPosition);
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.serverRecommendations.rationale.forEach((item) => {
      doc.text(`• ${item}`, 25, yPosition, { maxWidth: 170 });
      yPosition += 4;
    });
    yPosition += 5;
  }
  
  // Section 6: Disclaimer
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Disclaimer', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  DISCLAIMER_TEXT.split('\n').forEach((line) => {
    doc.text(line, 20, yPosition, { maxWidth: 170 });
    yPosition += 4;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, 20, 290);
    doc.text('Aeroskop Storage Solutions', 150, 290);
  }
  
  // Download the PDF
  const fileName = `aeroskop-storage-calculation-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
}

// Original PDF generator for backward compatibility
export async function generatePDFReport(recommendations: any) {
  const { jsPDF: jsPDFLib, autoTableFn: autoTable } = await loadPDFLibraries();
  const doc = new jsPDFLib() as any;
  
  // Helper to call autoTable
  const callAutoTable = (options: any) => {
    if (doc.autoTable && typeof doc.autoTable === 'function') {
      return doc.autoTable(options);
    } else if (autoTable && typeof autoTable === 'function') {
      return autoTable(doc, options);
    } else {
      throw new Error('autoTable is not available. Please ensure jspdf-autotable is properly installed.');
    }
  };
  
  // Colors
  const primaryColor = [59, 130, 246]; // Blue-500
  const accentColor = [16, 185, 129]; // Emerald-500
  
  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Aeroskop Storage Recommendation Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 25);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(recommendations.summary, 20, 55, { maxWidth: 170 });
  
  let yPosition = 70;
  
  // Storage Calculations
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Storage Calculations', 20, yPosition);
  yPosition += 8;
  
  const calculationsData = [
    ['Total Storage Required', `${recommendations.calculations.total_storage_tb.toFixed(2)} TB`],
    ['Daily Storage', `${recommendations.calculations.daily_storage_tb.toFixed(2)} TB`],
    ['Daily Storage per Camera', `${recommendations.calculations.daily_storage_per_camera_gb.toFixed(2)} GB`],
    ['Total Bitrate', `${recommendations.calculations.total_bitrate_mbps.toFixed(2)} Mbps`],
    ['Bitrate per Camera', `${recommendations.calculations.bitrate_per_camera.toFixed(2)} Mbps`],
    ['Retention Period', `${recommendations.calculations.retention_days} days`],
    ['Overhead Factor', `${recommendations.calculations.overhead_factor}x`]
  ];
  
  callAutoTable({
    startY: yPosition,
    head: [['Parameter', 'Value']],
    body: calculationsData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 90 } },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : yPosition + 50;
  
  // Product Recommendation
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Solution', 20, yPosition);
  yPosition += 8;
  
  // Single Recommended Product
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('RECOMMENDED PRODUCT', 20, yPosition);
  yPosition += 6;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const recommendation = recommendations.recommendation;
  doc.text(`Product: ${recommendation.product_name}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Model: ${recommendation.product_model}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Channels: ${recommendation.channel_capacity}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Storage: ${recommendation.storage_capacity_tb} TB`, 20, yPosition);
  yPosition += 4;
  doc.text(`CPU: ${recommendation.cpu}`, 20, yPosition);
  yPosition += 4;
  doc.text(`RAM: ${recommendation.ram}`, 20, yPosition);
  yPosition += 4;
  doc.text(`RAID Support: ${recommendation.raid_support}`, 20, yPosition);
  yPosition += 4;
  doc.text(`Why Recommended: ${recommendation.why_recommended}`, 20, yPosition);
  yPosition += 10;
  
  // Key Benefits
  if (recommendation.key_benefits && recommendation.key_benefits.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Benefits:', 20, yPosition);
    yPosition += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendation.key_benefits.forEach((benefit: string) => {
      doc.text(`• ${benefit}`, 25, yPosition);
      yPosition += 4;
    });
    yPosition += 10;
  }
  
  // Pros and Cons
  if (recommendation.pros && recommendation.pros.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('Advantages:', 20, yPosition);
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendation.pros.forEach((pro: string) => {
      doc.text(`• ${pro}`, 25, yPosition);
      yPosition += 4;
    });
    yPosition += 5;
  }
  
  if (recommendation.cons && recommendation.cons.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0);
    doc.text('Considerations:', 20, yPosition);
    yPosition += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendation.cons.forEach((con: string) => {
      doc.text(`• ${con}`, 25, yPosition);
      yPosition += 4;
    });
    yPosition += 10;
  }
  
  // Optimization Suggestions
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Optimization Suggestions', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  recommendations.optimization.suggestions.forEach((suggestion: string) => {
    doc.text(`• ${suggestion}`, 25, yPosition);
    yPosition += 4;
  });
  yPosition += 5;
  
  // Performance Benefits
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Benefits:', 20, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  recommendations.optimization.insights.forEach((insight: string) => {
    doc.text(`• ${insight}`, 25, yPosition);
    yPosition += 4;
  });
  yPosition += 5;
  
  // Technical Insights
  doc.setFont('helvetica', 'bold');
  doc.text('Technical Insights:', 20, yPosition);
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  
  // Add technical details
  doc.text(`• Storage Efficiency: Optimized for ${recommendations.calculations.total_storage_tb.toFixed(2)} TB requirement`, 25, yPosition);
  yPosition += 4;
  doc.text(`• Bitrate Optimization: ${recommendations.calculations.bitrate_per_camera.toFixed(2)} Mbps per camera`, 25, yPosition);
  yPosition += 4;
  doc.text(`• Scalability: Supports up to ${recommendation.channel_capacity} cameras`, 25, yPosition);
  yPosition += 4;
  doc.text(`• Retention: ${recommendations.calculations.retention_days} days with overhead protection`, 25, yPosition);
  yPosition += 10;
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, 20, 290);
    doc.text('Aeroskop Storage Solutions', 150, 290);
  }
  
  // Download the PDF
  const fileName = `aeroskop-storage-recommendation-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
}