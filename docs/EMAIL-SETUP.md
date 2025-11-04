# Email Report Scheduling Setup Guide

## 📧 Automated Email Reports

This guide explains how to set up automated email reports for the KPI Dashboard.

---

## 🚀 Quick Start

### Step 1: Start Email Service

```bash
node server-email.js
```

Server runs on `http://localhost:3002`

### Step 2: Access Email Scheduler

1. Login to admin panel (`http://localhost:4200/admin`)
2. Click **"📧 Email Reports"** button
3. You'll see the Email Scheduler page

---

## 🔧 SMTP Configuration

### For Development (Default):

The service uses Ethereal Email (fake SMTP) for testing:
- No configuration needed
- Emails won't actually be delivered
- Preview URLs provided to view emails

### For Production:

Create `.env` file with your SMTP server:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Service Port
EMAIL_PORT=3002
```

### Popular SMTP Providers:

#### Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Gmail App Password:** https://support.google.com/accounts/answer/185833

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### AWS SES:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
```

---

## 📅 Creating Email Schedules

### Step 1: Click "New Schedule"

### Step 2: Configure Schedule

**Frequency Options:**
- **Daily** - Every day at specified time
- **Weekly** - Every Monday at specified time
- **Monthly** - 1st day of month at specified time

**Time:**
- 24-hour format (e.g., 09:00, 14:30)
- Reports sent at this time each period

**Report Type:**
- **Summary** - Key metrics only
- **Detailed** - Full report with all data

**Recipients:**
- Add email addresses one by one
- Press Enter or click "Add" after each email
- Remove by clicking × on email tag
- No limit on recipients

### Step 3: Create Schedule

Click "Create Schedule" - it will:
1. Validate inputs
2. Create cron job on server
3. Add to active schedules list
4. Start sending reports automatically

---

## 📊 Report Content

### Email Report Includes:

1. **Header:**
   - Dashboard title
   - Report period
   - Generation timestamp

2. **KPI Cards:**
   - All KPI metrics with icons
   - Current values
   - Trend indicators (↑↓→)
   - Percentage changes
   - Color-coded values

3. **Footer:**
   - Auto-generated notice
   - Unsubscribe instructions

### Email Format:

Professional HTML email with:
- Responsive design
- Mobile-friendly layout
- Brand colors
- Clean typography
- Proper spacing

---

## 🧪 Testing Email Service

### Send Test Email:

1. Go to Email Scheduler page
2. Enter your email in "Test Email Service" section
3. Click "Send Test"
4. Check your inbox (or spam folder)

### For Development (Ethereal):

Test emails show a preview URL:
```
Preview: https://ethereal.email/message/xxxxx
```

Click the link to see how the email looks without actually sending it.

---

## 📋 Managing Schedules

### View Active Schedules:

The main page shows all schedules with:
- Frequency and time badges
- Report type
- Number of recipients
- Full recipient list

### Delete Schedule:

1. Click 🗑️ on any schedule card
2. Confirm deletion
3. Cron job stops immediately
4. No more emails sent

---

## 🎯 API Endpoints

### Send Immediate Email:

```http
POST http://localhost:3002/api/email/send
Content-Type: application/json

{
  "recipients": ["user@example.com"],
  "subject": "KPI Dashboard Report",
  "dashboardData": {
    "period": "Monthly",
    "kpis": [ /* KPI data */ ]
  }
}
```

### Create Schedule:

```http
POST http://localhost:3002/api/email/schedule
Content-Type: application/json

{
  "frequency": "daily",
  "time": "09:00",
  "recipients": ["user@example.com"],
  "reportType": "summary",
  "dashboardData": { /* dashboard data */ }
}
```

### List Schedules:

```http
GET http://localhost:3002/api/email/schedules
```

### Delete Schedule:

```http
DELETE http://localhost:3002/api/email/schedule/{id}
```

### Test Email:

```http
POST http://localhost:3002/api/email/test

{
  "recipient": "test@example.com"
}
```

---

## 🔄 Cron Schedule Format

The service converts frequency to cron expressions:

| Frequency | Cron Expression | Meaning |
|-----------|----------------|---------|
| Daily @ 09:00 | `0 9 * * *` | Every day at 9 AM |
| Weekly @ 09:00 | `0 9 * * 1` | Every Monday at 9 AM |
| Monthly @ 09:00 | `0 9 1 * *` | 1st of month at 9 AM |

---

## 🔒 Security & Privacy

### Best Practices:

1. **Use App Passwords**
   - Don't use your main email password
   - Generate app-specific passwords

2. **Encrypt Credentials**
   - Never commit `.env` to git
   - Use environment variables
   - Rotate credentials regularly

3. **Rate Limiting**
   - Limit emails per hour
   - Prevent spam/abuse

4. **Opt-out Mechanism**
   - Allow users to unsubscribe
   - Honor unsubscribe requests

5. **GDPR Compliance**
   - Store minimal data
   - Allow data deletion
   - Provide privacy policy

---

## 📧 Email Best Practices

### For Better Deliverability:

1. **Use reputable SMTP provider**
2. **Set up SPF/DKIM records**
3. **Use professional "from" address**
4. **Include unsubscribe link**
5. **Avoid spam trigger words**
6. **Test emails before scheduling**

### Email Design:

- ✅ Mobile responsive
- ✅ Clear subject lines
- ✅ Professional branding
- ✅ Easy to scan
- ✅ Call-to-action buttons

---

## 🐛 Troubleshooting

### Emails Not Sending?

1. **Check SMTP credentials**
   ```bash
   node server-email.js
   # Look for connection errors
   ```

2. **Test SMTP connection**
   ```bash
   curl -X POST http://localhost:3002/api/email/test \
     -H "Content-Type: application/json" \
     -d '{"recipient":"your-email@example.com"}'
   ```

3. **Check spam folder**
   - Emails might be filtered as spam
   - Whitelist sender address

4. **Verify email server is running**
   ```bash
   curl http://localhost:3002/api/health
   ```

5. **Check cron job logs**
   - Server console shows when jobs run
   - Look for error messages

### Common Errors:

**"Invalid login"**
- Fix: Check SMTP username/password
- Gmail: Use App Password, not regular password

**"Connection timeout"**
- Fix: Check SMTP host and port
- Verify firewall isn't blocking

**"Recipient rejected"**
- Fix: Verify email addresses are valid
- Check SMTP provider allows those domains

---

## 💡 Advanced Features

### Custom Email Templates:

Edit `generateEmailHTML()` function in `server-email.js` to customize:
- Add company logo
- Change color scheme
- Add additional sections
- Include chart images

### Attach PDF Reports:

Modify email service to attach PDF:

```javascript
const info = await transporter.sendMail({
  from: '"KPI Dashboard" <noreply@dashboard.com>',
  to: recipients,
  subject: 'KPI Dashboard Report',
  html: emailHtml,
  attachments: [{
    filename: 'report.pdf',
    content: pdfBuffer
  }]
});
```

### Multiple Schedules:

Create different schedules for:
- Executive team (summary, weekly)
- Management (detailed, daily)
- Stakeholders (summary, monthly)

---

## 📊 Usage Scenarios

### Scenario 1: Daily Executive Summary

```
Frequency: Daily
Time: 08:00
Recipients: ceo@company.com, cfo@company.com
Type: Summary
```

### Scenario 2: Weekly Team Report

```
Frequency: Weekly
Time: 09:00 (Monday)
Recipients: team@company.com
Type: Detailed
```

### Scenario 3: Monthly Stakeholder Update

```
Frequency: Monthly
Time: 09:00 (1st of month)
Recipients: board@company.com, investors@company.com
Type: Summary
```

---

## 🎨 Email Preview

The generated email includes:

```html
📊 KPI Dashboard Report

Period: Monthly
Generated: Nov 3, 2025, 1:30 PM

[KPI Cards in Grid]
💰 Total Revenue: $124,563 ↑ +12.5%
👥 New Customers: 1,234 ↓ -2.3%
📈 Conversion Rate: 3.24% → +0.5%
⏱️ Avg Response Time: 2.3s ↑ +8.2%

---
This is an automated report from KPI Dashboard.
To unsubscribe, contact your administrator.
```

---

## 🚀 Production Deployment

### Required:

1. **Use production SMTP** (SendGrid, AWS SES, etc.)
2. **Set up database** for schedule storage (not in-memory)
3. **Add authentication** to API endpoints
4. **Implement unsubscribe** mechanism
5. **Add email queue** (Bull, BullMQ)
6. **Monitor delivery** rates
7. **Handle bounces** and failures

### Recommended Architecture:

```
Frontend (Angular)
    ↓
Email API (Express - port 3002)
    ↓
Email Queue (Redis + Bull)
    ↓
SMTP Service (SendGrid/SES)
```

---

**Status:** ✅ Email Scheduling Complete  
**Last Updated:** November 3, 2025

