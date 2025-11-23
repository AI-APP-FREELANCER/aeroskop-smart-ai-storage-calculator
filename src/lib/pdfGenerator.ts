import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculatorForm, EnhancedStorageCalculation } from './types';

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
