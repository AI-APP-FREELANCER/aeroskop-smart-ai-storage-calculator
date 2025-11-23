import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProductSpecs {
  [key: string]: any;
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
