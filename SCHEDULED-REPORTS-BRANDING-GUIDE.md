# Scheduled Reports & Custom Branding Guide

## 📋 Overview

This guide covers two major enterprise features:
1. **Scheduled Reports** - Automated email reports with cron jobs
2. **Custom Branding/White-Label** - Complete branding customization

---

## 📧 Scheduled Reports

### Features

✅ **Automated Cron Jobs**
- Daily, weekly, or monthly schedules
- Customizable time selection
- Multiple recipients support
- Automatic report generation

✅ **Email Delivery Service**
- Powered by Nodemailer
- HTML email templates
- Test email functionality
- Delivery history tracking

✅ **Backend Scheduler**
- Node-cron for reliable scheduling
- Schedule management (create/delete)
- Report history and statistics
- Error handling and logging

### Setup

#### 1. Start the Email Service

```bash
npm run start:email
```

The service runs on `http://localhost:3002`

#### 2. Configure SMTP (Optional)

For production, set these environment variables:

```bash
SMTP_HOST=smtp.your-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
```

For development, the service uses Ethereal.email (fake SMTP) automatically.

### Usage

#### Access Email Scheduler

1. Navigate to **Admin** page (⚙️ button)
2. Click **📧 Email** button
3. You'll see the Email Scheduler interface

#### Create a Schedule

1. Click **"+ Create Schedule"**
2. Fill in the form:
   - **Frequency**: Daily, Weekly, or Monthly
   - **Time**: Select delivery time (24-hour format)
   - **Report Type**: Summary or Detailed
   - **Recipients**: Add email addresses (one at a time)
3. Click **"Create Schedule"**

The schedule will:
- Be saved with your organization's branding
- Include current dashboard data (KPIs)
- Run automatically at the specified time
- Send branded emails to all recipients

#### Send Test Email

1. Enter your email address in the "Test Email" section
2. Click **"Send Test Email"**
3. Check your inbox (or the preview URL for Ethereal)

#### Manage Schedules

- **View All**: All active schedules are listed
- **Delete**: Click the delete button (🗑️) on any schedule
- **History**: View sent reports in the report history

### API Endpoints

```
POST   /api/email/send        - Send immediate email
POST   /api/email/schedule    - Create email schedule
GET    /api/email/schedules   - List all schedules
DELETE /api/email/schedule/:id - Delete schedule
POST   /api/email/test        - Send test email
GET    /api/email/history     - Get report history
GET    /api/email/stats       - Get statistics
GET    /api/health            - Health check
```

### Cron Expressions

The service automatically converts frequency to cron expressions:

- **Daily**: Runs every day at specified time
  - Example: `09:00` → `0 9 * * *`
- **Weekly**: Runs every Monday at specified time
  - Example: `09:00` → `0 9 * * 1`
- **Monthly**: Runs on the 1st of each month at specified time
  - Example: `09:00` → `0 9 1 * *`

---

## 🎨 Custom Branding / White-Label

### Features

✅ **Logo Upload**
- PNG/JPG support
- Max file size: 1MB
- Automatic preview
- Base64 encoding for emails

✅ **Custom Color Schemes**
- Primary color picker
- Secondary color picker
- Real-time preview
- Applied to dashboard and emails

✅ **Custom Fonts**
- 13 pre-selected font families
- System fonts + Google Fonts
- Live font preview
- Applied globally

✅ **Branded Email Templates**
- Logo in header
- Custom colors
- Custom fonts
- Company name customization

✅ **Advanced Custom CSS**
- Inject custom styles
- Complete control over appearance
- Saved to localStorage
- Applied immediately

### Usage

#### Access Branding Settings

1. Navigate to **Admin** page (⚙️ button)
2. Click **🎨 Branding** button
3. You'll see the Branding & White-Label page

#### Upload Logo

1. Click **"📤 Upload Logo"**
2. Select a PNG or JPG file (max 1MB)
3. Preview appears immediately
4. Logo is used in:
   - Dashboard header (optional)
   - Email reports
   - PDFs (future)

#### Set Colors

1. Click the color picker for **Primary Color**
2. Choose your brand color
3. Click the color picker for **Secondary Color**
4. Choose your secondary brand color
5. See live preview below

Colors are applied to:
- Buttons and links
- Charts and graphs
- Email templates
- KPI cards

#### Select Font

1. Open the **Typography** dropdown
2. Select from available fonts:
   - Default (System)
   - Arial, Helvetica, Georgia
   - Times New Roman, Courier New
   - Verdana, Trebuchet MS
   - Roboto, Open Sans, Lato, Montserrat, Inter
3. Preview shows font immediately
4. Font is applied to:
   - Dashboard text
   - Email templates
   - All UI elements

#### Set Theme

Choose default theme:
- ☀️ **Light**: Always light mode
- 🌙 **Dark**: Always dark mode
- 🔄 **Auto**: Follows system preference

#### Custom CSS (Advanced)

For complete control:

1. Scroll to **Custom CSS** section
2. Enter CSS code:
   ```css
   .kpi-card {
     border-radius: 1rem;
     box-shadow: 0 4px 6px rgba(0,0,0,0.1);
   }
   ```
3. Click **"Apply Custom CSS"**
4. Changes apply immediately

#### Preview & Save

1. Click **"👀 Apply Preview to Dashboard"** to preview changes
2. Navigate back to dashboard to see live preview
3. Return to branding page
4. Click **"💾 Save & Apply"** to save permanently

#### Reset to Default

Click **"🔄 Reset to Default"** to restore default branding.

### Branding in Emails

All email reports automatically include:
- Your company logo in the header
- Your primary color in borders/headers
- Your secondary color in highlights
- Your custom font throughout
- Your company name in title and footer

Example email structure:
```
┌─────────────────────────────┐
│ [Your Logo]                  │
│ 📊 Your Company Report       │
│ Period: Current              │
│ Generated: [Date]            │
├─────────────────────────────┤
│ KPI Cards (in your colors)  │
│ ┌──────┐ ┌──────┐           │
│ │ KPI1 │ │ KPI2 │           │
│ └──────┘ └──────┘           │
├─────────────────────────────┤
│ Footer with your company    │
└─────────────────────────────┘
```

---

## 🔧 Technical Details

### Email Template System

The email template system is located in `server-email.js`:

```javascript
function generateEmailHTML(dashboardData, branding)
```

It supports:
- Dynamic branding injection
- Responsive design
- Mobile-friendly layout
- Fallback for missing data

### Branding Storage

Branding is stored in:
- **OrganizationService**: Per-organization settings
- **localStorage**: Custom CSS and preferences
- **Email payload**: Included in scheduled reports

### Font Loading

Fonts are applied via CSS variables:
```css
--font-family: var(--custom-font, system-ui);
```

System fonts load instantly. Web fonts (Roboto, Open Sans, etc.) load from Google Fonts CDN.

---

## 📊 Use Cases

### 1. White-Label for Clients

Agency serving multiple clients:
- Each client gets their own organization
- Upload client logo
- Set client brand colors
- Automated reports with client branding

### 2. Multi-Department Company

Large company with multiple departments:
- Marketing: Red theme, Marketing logo
- Sales: Blue theme, Sales logo
- Finance: Green theme, Finance logo
- Each gets branded reports

### 3. Daily Executive Summary

C-level executives:
- Daily report at 8:00 AM
- Summary of key metrics
- Branded with company identity
- Sent to executive team

---

## 🚀 Getting Started (Quick)

1. **Start email service**:
   ```bash
   npm run start:email
   ```

2. **Configure branding**:
   - Go to Admin → Branding
   - Upload logo, set colors, choose font
   - Click "Save & Apply"

3. **Create schedule**:
   - Go to Admin → Email
   - Click "Create Schedule"
   - Set frequency, time, recipients
   - Click "Create Schedule"

4. **Test it**:
   - Enter your email
   - Click "Send Test Email"
   - Check inbox

Done! Your branded reports will be sent automatically.

---

## 🔍 Troubleshooting

### Email not sending

- ✅ Check email service is running (`npm run start:email`)
- ✅ Check port 3002 is not in use
- ✅ For production, verify SMTP credentials
- ✅ Check console for error messages

### Logo not appearing

- ✅ Ensure file is under 1MB
- ✅ Use PNG or JPG format
- ✅ Check browser console for base64 errors

### Fonts not applying

- ✅ Clear browser cache
- ✅ Ensure font family is selected from dropdown
- ✅ Web fonts require internet connection

### Cron jobs not running

- ✅ Keep email service running continuously
- ✅ Check system time is correct
- ✅ View report history for execution logs

---

## 📈 Future Enhancements

Planned features:
- [ ] Multiple email templates
- [ ] Report attachments (PDF, CSV)
- [ ] Custom email content
- [ ] Schedule pause/resume
- [ ] Advanced recipient lists
- [ ] Email open tracking
- [ ] Click-through analytics
- [ ] A/B testing for templates
- [ ] Multi-language support
- [ ] Template marketplace

---

## 💡 Tips & Best Practices

1. **Logo**: Use transparent PNG for best results
2. **Colors**: Ensure good contrast for accessibility
3. **Fonts**: System fonts load faster
4. **Testing**: Always send test email before scheduling
5. **Recipients**: Start with small list, expand gradually
6. **Timing**: Consider recipient time zones
7. **Frequency**: Don't over-email (weekly is often enough)
8. **Content**: Keep reports concise and actionable

---

## 🤝 Support

For issues or questions:
- Check console logs
- Review API responses
- Test with curl/Postman
- Enable debug mode in email service

Happy reporting! 📊📧🎨

