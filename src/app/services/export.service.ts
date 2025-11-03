import { Injectable } from '@angular/core';
import { KpiData, ChartDataPoint } from './data.service';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  exportToExcel(data: any[], filename: string): void {
    // Create HTML table that Excel can read
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.map(row => `<tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    this.downloadFile(htmlTable, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  exportChartToPNG(chartElement: any, filename: string): void {
    if (!chartElement || !chartElement.toBase64Image) {
      alert('Chart not available for export');
      return;
    }

    try {
      const base64Image = chartElement.toBase64Image();
      const link = document.createElement('a');
      link.href = base64Image;
      link.download = `${filename}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('Failed to export chart');
    }
  }

  exportDashboardToPDF(dashboardData: {
    kpis: KpiData[];
    period: string;
    date: string;
  }): void {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(51, 51, 51);
    pdf.text('KPI Dashboard Report', margin, margin + 10);
    
    // Metadata
    pdf.setFontSize(11);
    pdf.setTextColor(102, 102, 102);
    pdf.text(`Period: ${dashboardData.period}`, margin, margin + 20);
    pdf.text(`Generated: ${dashboardData.date}`, margin, margin + 27);
    
    // Divider line
    pdf.setDrawColor(76, 175, 80);
    pdf.setLineWidth(0.5);
    pdf.line(margin, margin + 32, pageWidth - margin, margin + 32);
    
    // KPI Cards
    let yPosition = margin + 45;
    const cardWidth = (contentWidth - 10) / 2;
    const cardHeight = 35;
    
    dashboardData.kpis.forEach((kpi, index) => {
      const xPosition = margin + (index % 2) * (cardWidth + 10);
      
      // Card border
      pdf.setDrawColor(221, 221, 221);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(xPosition, yPosition, cardWidth, cardHeight, 2, 2);
      
      // Icon and Title
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text(`${kpi.icon} ${kpi.title}`, xPosition + 5, yPosition + 8);
      
      // Value
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const color = this.hexToRgb(kpi.color);
      pdf.setTextColor(color.r, color.g, color.b);
      pdf.text(kpi.value, xPosition + 5, yPosition + 20);
      
      // Change indicator
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const changeColor = kpi.trend === 'up' 
        ? { r: 16, g: 185, b: 129 } 
        : kpi.trend === 'down' 
          ? { r: 239, g: 68, b: 68 } 
          : { r: 102, g: 102, b: 102 };
      pdf.setTextColor(changeColor.r, changeColor.g, changeColor.b);
      const arrow = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';
      const changeText = `${arrow} ${kpi.change > 0 ? '+' : ''}${kpi.change}%`;
      pdf.text(changeText, xPosition + 5, yPosition + 29);
      
      // Move to next row after every 2 cards
      if (index % 2 === 1) {
        yPosition += cardHeight + 10;
      }
      
      // Add new page if needed
      if (yPosition > pageHeight - 60 && index < dashboardData.kpis.length - 1) {
        pdf.addPage();
        yPosition = margin + 10;
      }
    });
    
    // Footer
    const footerY = pageHeight - 20;
    pdf.setFontSize(9);
    pdf.setTextColor(153, 153, 153);
    pdf.text('This report was generated automatically from the KPI Dashboard.', margin, footerY);
    pdf.text(`Page 1 of 1`, pageWidth - margin - 20, footerY);
    
    // Save the PDF
    pdf.save(`dashboard-report-${Date.now()}.pdf`);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

