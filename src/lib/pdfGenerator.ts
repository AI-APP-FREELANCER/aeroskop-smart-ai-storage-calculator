import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculatorForm, EnhancedStorageCalculation, AIRecommendationResponse } from './types';

interface ProductSpecs {
  [key: string]: any;
}

interface ExportData {
  formData: CalculatorForm;
  calculationResult: EnhancedStorageCalculation;
  serverRecommendations?: any;
}

export function generateProductSpecPDF(
  productName: string,
  model: string,
  tagline: string,
  specs: ProductSpecs
): void {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  let yPosition = 20;
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Aeroskope Systems', 14, yPosition);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Technical Specification', 14, yPosition + 10);
  
  // Product Information
  yPosition += 25;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(productName, 14, yPosition);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Model: ${model}`, 14, yPosition + 7);
  
  // Tagline/Highlights
  yPosition += 15;
  doc.setFontSize(11);
  const taglineLines = doc.splitTextToSize(tagline, 180);
  doc.text(taglineLines, 14, yPosition);
  
  yPosition += taglineLines.length * 5 + 10;
    
    // Process each specification category
    Object.keys(specs).forEach((category, categoryIndex) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Category header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
      doc.text(categoryName, 14, yPosition);
      yPosition += 8;
      
      // Get category specs
      const categorySpecs = specs[category];
      
      // Prepare table data
      const tableData: string[][] = [];
      
      if (typeof categorySpecs === 'object' && categorySpecs !== null) {
        Object.keys(categorySpecs).forEach((key) => {
          const value = categorySpecs[key];
          let displayValue = '';
          
          if (Array.isArray(value)) {
            displayValue = value.join(', ');
          } else if (typeof value === 'object' && value !== null) {
            displayValue = JSON.stringify(value);
          } else {
            displayValue = String(value);
          }
          
          const specName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          tableData.push([specName, displayValue]);
        });
      }
      
      // Add table if there's data
      if (tableData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [['Specification', 'Details']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [37, 99, 235], // Blue color
            textColor: 255,
            fontStyle: 'bold',
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 130 },
          },
          margin: { left: 14, right: 14 },
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    });
    
    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Specifications subject to change without notice. Copyright ${new Date().getFullYear()}.`,
        105,
        285,
        { align: 'center' }
      );
    }
    
  // Save PDF
  doc.save(`${model}_Technical_Specification.pdf`);
}

// Enhanced PDF Report Generator for Calculator
export async function generateEnhancedPDFReport(data: ExportData): Promise<void> {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  let yPosition = 20;
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Aeroskope Systems', 14, yPosition);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('AI Surveillance Storage Calculator Report', 14, yPosition + 10);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPosition + 18);
  
  yPosition += 30;
  
  // Section 1: Input Parameters
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Input Parameters', 14, yPosition);
  yPosition += 10;
  
  const inputData = [
    ['Parameter', 'Value'],
    ['Number of Cameras', String(data.formData.cameras)],
    ['Resolution', data.formData.resolution],
    ['Frame Rate (FPS)', String(data.formData.customFps || data.formData.fps)],
    ['Compression Codec', data.formData.codec],
    ['Bitrate (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)],
    ['Recording Hours Per Day', String(data.formData.recordingHoursPerDay)],
    ['Motion Activity (%)', String(data.formData.activityPercent)],
    ['Retention Period (Days)', String(data.formData.retentionDays)],
    ['Recording Mode', data.formData.recordingMode || 'continuous'],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [inputData[0]],
    body: inputData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 110 },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Section 2: Calculation Summary
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculation Summary', 14, yPosition);
  yPosition += 10;
  
  const calcData = [
    ['Metric', 'Value'],
    ['Total Storage Required (TB)', data.calculationResult.totalStorageTB.toFixed(2)],
    ['Daily Storage (TB)', (data.calculationResult.totalStorageTB / data.formData.retentionDays).toFixed(2)],
    ['Daily Storage per Camera (GB)', data.calculationResult.dailyStoragePerCameraGB.toFixed(2)],
    ['Total Bitrate (Mbps)', data.calculationResult.totalBitrateMbps.toFixed(2)],
    ['Bitrate per Camera (Mbps)', data.calculationResult.bitratePerCamera.toFixed(2)],
    ['Adjusted Bitrate (Mbps)', data.calculationResult.adjustedBitrate.toFixed(2)],
  ];
  
  if (data.calculationResult.adjustedMotionPercent !== undefined) {
    calcData.push(['Adjusted Motion %', data.calculationResult.adjustedMotionPercent.toFixed(2)]);
  }
  
  autoTable(doc, {
    startY: yPosition,
    head: [calcData[0]],
    body: calcData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 110 },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Results are approximate estimations. Copyright ${new Date().getFullYear()} Aeroskope Systems.`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  // Save PDF
  doc.save(`Storage_Calculator_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// PDF Report Generator for AI Recommendations
export async function generatePDFReport(recommendations: AIRecommendationResponse): Promise<void> {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  let yPosition = 20;
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Aeroskope Systems', 14, yPosition);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('AI Storage Recommendation Report', 14, yPosition + 10);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, yPosition + 18);
  
  yPosition += 30;
  
  // Section 1: Storage Calculations
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Storage Calculations', 14, yPosition);
  yPosition += 10;
  
  const calcData = [
    ['Metric', 'Value'],
    ['Total Storage Required (TB)', recommendations.calculations.total_storage_tb.toFixed(2)],
    ['Daily Storage (TB)', recommendations.calculations.daily_storage_tb.toFixed(2)],
    ['Daily Storage per Camera (GB)', recommendations.calculations.daily_storage_per_camera_gb?.toFixed(2) || 'N/A'],
    ['Total Bitrate (Mbps)', recommendations.calculations.total_bitrate_mbps.toFixed(2)],
    ['Bitrate per Camera (Mbps)', recommendations.calculations.bitrate_per_camera?.toFixed(2) || 'N/A'],
    ['Retention Days', recommendations.calculations.retention_days.toString()],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [calcData[0]],
    body: calcData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 110 },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Section 2: Recommended Product
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Product', 14, yPosition);
  yPosition += 10;
  
  const product = recommendations.recommendation;
  const productData = [
    ['Property', 'Details'],
    ['Product Name', product.product_name],
    ['Model', product.product_model],
    ['Channel Capacity', product.channel_capacity],
    ['Storage Capacity (TB)', product.storage_capacity_tb.toString()],
    ['CPU', product.cpu],
    ['RAM', product.ram],
    ['RAID Support', product.raid_support],
  ];
  
  autoTable(doc, {
    startY: yPosition,
    head: [productData[0]],
    body: productData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 110 },
    },
    margin: { left: 14, right: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Section 3: Key Benefits
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  if (product.pros && product.pros.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Benefits', 14, yPosition);
    yPosition += 10;
    
    const prosData = product.pros.map((pro, index) => [`${index + 1}.`, pro]);
    
    autoTable(doc, {
      startY: yPosition,
      body: prosData,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 175 },
      },
      margin: { left: 14, right: 14 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Section 4: Summary
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = doc.splitTextToSize(recommendations.summary, 180);
  doc.text(summaryLines, 14, yPosition);
  
  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `AI-powered recommendations. Copyright ${new Date().getFullYear()} Aeroskope Systems.`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  // Save PDF
  doc.save(`AI_Storage_Recommendation_${new Date().toISOString().split('T')[0]}.pdf`);
}
