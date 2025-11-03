import { Injectable } from '@angular/core';
import { KpiData, ChartDataPoint } from './data.service';

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
    // Create a simple HTML report
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>KPI Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          .header { border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
          .kpi-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
          .kpi-title { color: #666; font-size: 14px; margin-bottom: 10px; }
          .kpi-value { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
          .kpi-change { font-size: 14px; }
          .positive { color: #10b981; }
          .negative { color: #ef4444; }
          .footer { margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KPI Dashboard Report</h1>
          <p><strong>Period:</strong> ${dashboardData.period}</p>
          <p><strong>Generated:</strong> ${dashboardData.date}</p>
        </div>
        <div class="kpi-grid">
          ${dashboardData.kpis.map(kpi => `
            <div class="kpi-card">
              <div class="kpi-title">${kpi.icon} ${kpi.title}</div>
              <div class="kpi-value" style="color: ${kpi.color}">${kpi.value}</div>
              <div class="kpi-change ${kpi.trend === 'up' ? 'positive' : kpi.trend === 'down' ? 'negative' : ''}">
                ${kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} 
                ${kpi.change > 0 ? '+' : ''}${kpi.change}%
              </div>
            </div>
          `).join('')}
        </div>
        <div class="footer">
          <p>This report was generated automatically from the KPI Dashboard.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${Date.now()}.html`;
    link.click();
    window.URL.revokeObjectURL(url);

    // Note: For actual PDF, would need a library like jsPDF or html2pdf
    alert('Report downloaded as HTML. Open in browser and use Print to PDF for PDF format.');
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

