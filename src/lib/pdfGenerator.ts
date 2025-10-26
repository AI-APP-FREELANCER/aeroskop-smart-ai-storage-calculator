import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generatePDFReport(recommendations: any) {
  const doc = new jsPDF();
  
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
  
  (doc as any).autoTable({
    startY: yPosition,
    head: [['Parameter', 'Value']],
    body: calculationsData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 70 } }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
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