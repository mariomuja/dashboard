const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.EMAIL_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransporter({
  // For development - uses ethereal.email (fake SMTP)
  // For production, replace with your SMTP server
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'test@ethereal.email',
    pass: process.env.SMTP_PASS || 'test123'
  }
});

// In-memory schedule storage (use database in production)
let schedules = [];
let reportHistory = [];

// Endpoint to create email schedule
app.post('/api/email/schedule', async (req, res) => {
  try {
    const { frequency, time, recipients, reportType, dashboardData } = req.body;

    if (!frequency || !time || !recipients || !recipients.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const schedule = {
      id: Date.now().toString(),
      frequency, // 'daily', 'weekly', 'monthly'
      time, // '09:00'
      recipients,
      reportType, // 'summary', 'detailed'
      dashboardData,
      active: true,
      createdAt: new Date()
    };

    schedules.push(schedule);

    // Set up cron job
    const cronExpression = getCronExpression(frequency, time);
    const job = cron.schedule(cronExpression, () => {
      sendScheduledReport(schedule);
    });

    schedule.cronJob = job;

    res.json({
      success: true,
      message: 'Email schedule created',
      schedule: {
        id: schedule.id,
        frequency: schedule.frequency,
        time: schedule.time,
        recipients: schedule.recipients
      }
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Endpoint to send immediate email report
app.post('/api/email/send', async (req, res) => {
  try {
    const { recipients, subject, dashboardData } = req.body;

    if (!recipients || !recipients.length) {
      return res.status(400).json({ error: 'Recipients required' });
    }

    const emailHtml = generateEmailHTML(dashboardData);

    const info = await transporter.sendMail({
      from: '"KPI Dashboard" <noreply@dashboard.com>',
      to: recipients.join(', '),
      subject: subject || 'KPI Dashboard Report',
      html: emailHtml
    });

    console.log('Email sent:', info.messageId);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // For ethereal.email
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Get all schedules
app.get('/api/email/schedules', (req, res) => {
  res.json({
    schedules: schedules.map(s => ({
      id: s.id,
      frequency: s.frequency,
      time: s.time,
      recipients: s.recipients,
      reportType: s.reportType,
      active: s.active,
      createdAt: s.createdAt
    }))
  });
});

// Delete schedule
app.delete('/api/email/schedule/:id', (req, res) => {
  const { id } = req.params;
  const index = schedules.findIndex(s => s.id === id);

  if (index > -1) {
    const schedule = schedules[index];
    if (schedule.cronJob) {
      schedule.cronJob.stop();
    }
    schedules.splice(index, 1);
    res.json({ success: true, message: 'Schedule deleted' });
  } else {
    res.status(404).json({ error: 'Schedule not found' });
  }
});

// Helper: Convert frequency to cron expression
function getCronExpression(frequency, time) {
  const [hours, minutes] = time.split(':');

  switch (frequency) {
    case 'daily':
      return `${minutes} ${hours} * * *`;
    case 'weekly':
      return `${minutes} ${hours} * * 1`; // Every Monday
    case 'monthly':
      return `${minutes} ${hours} 1 * *`; // 1st of each month
    default:
      return `${minutes} ${hours} * * *`;
  }
}

// Helper: Send scheduled report
async function sendScheduledReport(schedule) {
  console.log(`Sending scheduled report: ${schedule.id}`);

  try {
    const emailHtml = generateEmailHTML(schedule.dashboardData);

    const info = await transporter.sendMail({
      from: '"KPI Dashboard" <noreply@dashboard.com>',
      to: schedule.recipients.join(', '),
      subject: `KPI Dashboard ${schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} Report`,
      html: emailHtml
    });

    console.log(`Report sent to ${schedule.recipients.length} recipients`);
    
    // Log to history
    reportHistory.push({
      id: `report-${Date.now()}`,
      scheduleId: schedule.id,
      scheduleName: `${schedule.frequency} Report`,
      sentAt: new Date(),
      recipients: schedule.recipients,
      status: 'success',
      messageId: info.messageId
    });
    
    // Keep only last 100 reports in history
    if (reportHistory.length > 100) {
      reportHistory = reportHistory.slice(-100);
    }
  } catch (error) {
    console.error('Error sending scheduled report:', error);
    
    // Log error to history
    reportHistory.push({
      id: `report-${Date.now()}`,
      scheduleId: schedule.id,
      scheduleName: `${schedule.frequency} Report`,
      sentAt: new Date(),
      recipients: schedule.recipients,
      status: 'failed',
      error: error.message
    });
  }
}

// Helper: Generate email HTML
function generateEmailHTML(dashboardData) {
  if (!dashboardData || !dashboardData.kpis) {
    return '<html><body><h1>KPI Dashboard Report</h1><p>No data available</p></body></html>';
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; margin: 0 0 10px 0; }
        .header { border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .meta { color: #666; font-size: 14px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
        .kpi-card { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background-color: #fafafa; }
        .kpi-title { color: #666; font-size: 14px; margin-bottom: 10px; font-weight: 600; }
        .kpi-value { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .kpi-change { font-size: 14px; font-weight: 600; }
        .positive { color: #10b981; }
        .negative { color: #ef4444; }
        .neutral { color: #6b7280; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 KPI Dashboard Report</h1>
          <p class="meta">
            <strong>Period:</strong> ${dashboardData.period || 'Current'}<br>
            <strong>Generated:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
        
        <div class="kpi-grid">
          ${dashboardData.kpis.map(kpi => `
            <div class="kpi-card">
              <div class="kpi-title">${kpi.icon} ${kpi.title}</div>
              <div class="kpi-value" style="color: ${kpi.color}">${kpi.value}</div>
              <div class="kpi-change ${kpi.trend === 'up' ? 'positive' : kpi.trend === 'down' ? 'negative' : 'neutral'}">
                ${kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} 
                ${kpi.change > 0 ? '+' : ''}${kpi.change}%
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>This is an automated report from KPI Dashboard.</p>
          <p>To unsubscribe or modify your email preferences, please contact your administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Test email configuration endpoint
app.post('/api/email/test', async (req, res) => {
  try {
    const { recipient } = req.body;

    const info = await transporter.sendMail({
      from: '"KPI Dashboard" <noreply@dashboard.com>',
      to: recipient || 'test@example.com',
      subject: 'Test Email from KPI Dashboard',
      html: '<h1>Test Successful!</h1><p>Email service is working correctly.</p>'
    });

    res.json({
      success: true,
      message: 'Test email sent',
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Get report history
app.get('/api/email/history', (req, res) => {
  res.json({
    history: reportHistory.slice(-50).reverse() // Last 50, newest first
  });
});

// Get schedule statistics
app.get('/api/email/stats', (req, res) => {
  const totalSent = reportHistory.filter(r => r.status === 'success').length;
  const totalFailed = reportHistory.filter(r => r.status === 'failed').length;
  const lastSent = reportHistory.length > 0 ? reportHistory[reportHistory.length - 1] : null;
  
  res.json({
    activeSchedules: schedules.length,
    totalReportsSent: totalSent,
    totalReportsFailed: totalFailed,
    lastReport: lastSent,
    uptime: process.uptime()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Email Service',
    activeSchedules: schedules.length,
    totalReports: reportHistory.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Email service running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/email/send - Send immediate email');
  console.log('  POST /api/email/schedule - Create email schedule');
  console.log('  GET  /api/email/schedules - List all schedules');
  console.log('  DELETE /api/email/schedule/:id - Delete schedule');
  console.log('  POST /api/email/test - Send test email');
});

