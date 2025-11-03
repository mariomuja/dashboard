# 🎨 UI Management Guide

Complete guide to all management interfaces in the KPI Dashboard.

## 📍 Overview

All management UIs are accessible from the **Admin Panel** (`/admin`) after logging in at `/login` with password `admin123`.

---

## 🔌 Data & Analytics

### 1. **Data Sources** (`/data-sources`)

**Purpose:** Manage connections to external data sources

**Features:**
- 13 pre-configured data source templates
- Visual data source cards with statistics
- Connection testing and validation
- Credentials management
- Data preview and synchronization

**Supported Sources:**
- **Databases:** PostgreSQL, MySQL, MongoDB
- **Data Warehouses:** Snowflake, BigQuery
- **APIs:** REST API, GraphQL
- **Cloud:** AWS CloudWatch, Azure Monitor, GCP Monitoring
- **SaaS:** Salesforce, HubSpot, Google Analytics

**Usage:**
1. Click "➕ Add Data Source"
2. Select source type from templates
3. Fill in connection details and credentials
4. Test connection
5. Save and sync data

---

### 2. **ETL Jobs** (`/etl-jobs`)

**Purpose:** Manage Extract, Transform, Load pipelines

**Features:**
- Visual job cards with status indicators
- Real-time job execution
- Job logs and statistics
- Pause/resume functionality
- Schedule management

**Job Components:**
- **Extract:** Pull data from sources
- **Transform:** 6 transformation types (Map, Filter, Calculate, Aggregate, Rename, Custom)
- **Validate:** 6 validation types (Required, Type, Range, Regex, Unique, Custom)
- **Load:** Push to destination

**Job Statuses:**
- ⭕ Idle - Ready to run
- ⏳ Running - Currently executing
- ✅ Completed - Finished successfully
- ❌ Failed - Error occurred
- ⏸️ Paused - Temporarily stopped

**Usage:**
1. Jobs are created programmatically via `EtlPipelineService`
2. View job list and statistics
3. Click job to view logs
4. Run, pause, resume, or view stats

---

### 3. **Advanced Analytics** (`/analytics`)

**Purpose:** Perform sophisticated data analysis

**Features:**
- 4 analysis types with interactive UIs
- Real-time calculation
- Visual results presentation
- Multiple algorithm support

**Analysis Types:**

#### 📈 **Forecasting**
- **Methods:** ARIMA, Prophet, Exponential Smoothing, Linear Regression
- **Metrics:** MSE, RMSE, MAE, R²
- **Output:** Future predictions with confidence intervals

#### 👥 **Cohort Analysis**
- **Purpose:** User retention over time
- **Output:** Retention heatmap and average retention rates
- **Visualization:** Color-coded cohort table

#### 🔽 **Funnel Analysis**
- **Purpose:** Conversion rate optimization
- **Output:** Step-by-step conversion and drop-off rates
- **Visualization:** Progress bars and statistics

#### 🧪 **A/B Testing**
- **Tests:** T-Test, Z-Test, Chi-Square
- **Output:** Statistical significance, p-value, uplift percentage
- **Recommendation:** Data-driven decision guidance

**Usage:**
1. Select analysis type from tabs
2. Configure parameters (method, data, etc.)
3. Click "▶️ Run [Analysis]"
4. View results and metrics

---

## 🔒 Security & Governance

### 4. **Audit Trail** (`/audit-trail`)

**Purpose:** Comprehensive activity logging and monitoring

**Features:**
- Searchable audit log
- Advanced filtering (action, user, status, date range)
- Security event alerts
- Statistics dashboard
- CSV export

**Tracked Events:**
- User logins/logouts
- Data modifications (create, update, delete)
- Resource access (view, export)
- System events
- Security incidents

**Filtering:**
- Action type
- User ID
- Status (success, failure, pending)
- Date range
- Resource type

**Usage:**
1. View statistics panel (total events, success rate, unique users)
2. Apply filters to narrow down logs
3. Click entries to see full details
4. Export to CSV for offline analysis

---

### 5. **Tenant Management** (`/tenants`)

**Purpose:** Multi-tenancy administration

**Features:**
- Tenant creation and management
- Resource limits configuration
- Status control (active, suspended, trial)
- Feature flag management
- Data isolation

**Tenant Settings:**
- Max users allowed
- Storage quota (GB)
- Allowed features
- Custom branding permissions
- Domain management

**Tenant Statuses:**
- ✅ Active - Fully operational
- ⏸️ Suspended - Temporarily disabled
- 🔄 Trial - Limited access period

**Usage:**
1. Click "➕ New Tenant"
2. Fill in tenant details (name, domain, limits)
3. Configure allowed features
4. Activate or suspend tenants
5. Edit or delete existing tenants

---

### 6. **Temporary Access** (`/temp-access`)

**Purpose:** Time-limited resource permissions

**Features:**
- Grant temporary access to users
- Automatic expiration
- Permission granularity (view, edit, delete, share)
- Extension capability
- Expiration alerts

**Grant Components:**
- User ID
- Resource type (dashboard, report, datasource, widget, etl-job)
- Resource ID
- Permissions array
- Expiration date/time
- Reason/justification

**Alerts:**
- ⚠️ Expiring within 24 hours
- Visual indicators on grant cards
- Expired grants marked clearly

**Usage:**
1. Click "➕ New Grant"
2. Enter user ID and resource details
3. Select permissions (checkboxes)
4. Set expiration date/time
5. Add optional reason
6. Extend or revoke as needed

---

## 🎨 Customization & Reporting

### 7. **Branding Settings** (`/branding`)

**Purpose:** White-label customization

**Features:**
- Logo upload (drag-and-drop)
- Color customization (primary, secondary, accent)
- Font selection (14 professional fonts)
- Theme preference (light/dark/system)
- Custom CSS injection
- Live preview

**Customizable Elements:**
- Organization name
- Logo image
- Color palette
- Typography
- Theme mode
- Additional CSS

**Usage:**
1. Upload custom logo
2. Select brand colors using color pickers
3. Choose font family from dropdown
4. Set theme preference
5. Add custom CSS for advanced styling
6. Preview changes in real-time
7. Save branding settings

---

### 8. **Email Scheduler** (`/email-scheduler`)

**Purpose:** Automated report distribution

**Features:**
- Cron job scheduling
- Multiple recipients
- Report format selection
- Email templates
- Report history
- Send test emails

**Scheduling Options:**
- Daily at specific time
- Weekly on selected day
- Monthly on specific date
- Custom cron expressions

**Report Formats:**
- PDF attachments
- HTML emails with charts
- CSV data exports

**Usage:**
1. Create new scheduled report
2. Select frequency and time
3. Add recipient email addresses
4. Choose report format
5. Send test email to verify
6. Activate schedule

---

### 9. **User Management** (`/users`)

**Purpose:** Advanced user administration

**Features:**
- User CRUD operations
- Role assignment (Admin, Editor, Viewer)
- Invitation system
- Status management (active, inactive)
- Bulk operations

**User Roles:**
- **Admin:** Full system access
- **Editor:** Create and modify content
- **Viewer:** Read-only access

**User Fields:**
- Name, email
- Role and status
- Organization affiliation
- Created/updated dates

**Usage:**
1. View user list with filters
2. Click "Add User" for new users
3. Edit existing users
4. Send invitation emails
5. Change roles and status

---

### 10. **Two-Factor Authentication** (`/2fa-setup`)

**Purpose:** Enhanced account security

**Features:**
- QR code generation
- TOTP (Time-based One-Time Password)
- Backup codes
- Token verification
- Re-generation capability

**Setup Process:**
1. Generate secret key
2. Scan QR code with authenticator app
3. Save backup codes securely
4. Verify token
5. Enable 2FA

**Supported Apps:**
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible app

---

## 🔄 Dashboard Management

### 11. **Version History** (`/version-history`)

**Purpose:** Dashboard version control (Git-like)

**Features:**
- Save named versions
- Rollback to previous versions
- Compare versions side-by-side
- View change history
- Tag management
- Version statistics

**Version Metadata:**
- Version name
- Creator
- Timestamp
- Widget count
- Layout dimensions
- Associated tags

**Usage:**
1. View version list and statistics
2. Search and filter versions
3. Click version to view details
4. Rollback to selected version
5. Compare two versions
6. Add/remove tags
7. Delete old versions

---

### 12. **Dashboard Builder** (`/builder`)

**Purpose:** Drag-and-drop dashboard customization

**Features:**
- Grid-based layout (12 columns × 100 rows)
- Widget library
- Resize handles
- Snap to grid
- Template application
- Version saving
- Real-time preview

**Available Widgets:**
- KPI Cards (4 types)
- Charts (Revenue, Sales, Conversion, Pie)
- Goal Tracker
- AI Insights Panel
- Comments Panel

**Templates:**
- Executive Overview
- Sales Focus
- Marketing Focus
- Minimal Dashboard

**Usage:**
1. Drag widgets from library to grid
2. Resize using corner handles
3. Position by dragging
4. Show/hide widgets
5. Remove unwanted widgets
6. Apply pre-built templates
7. Save version
8. Click "Done" to apply changes

---

## 🚀 Quick Start Guide

### First Time Setup:

1. **Login:** Navigate to `/login` and enter password `admin123`
2. **Access Admin:** Go to `/admin` to see all management options
3. **Explore UIs:** Click any button in the header to explore features

### Recommended Order:

1. 🎨 **Branding** - Customize your dashboard appearance
2. 👥 **Users** - Add team members
3. 🔌 **Data Sources** - Connect your data
4. ⚙️ **ETL Jobs** - Create data pipelines
5. 🔬 **Analytics** - Analyze your data
6. 📋 **Audit Trail** - Monitor activity
7. 📧 **Email Scheduler** - Automate reports

---

## 🎯 Tips & Best Practices

### Performance:
- Use ETL jobs to pre-process data
- Cache frequently accessed data sources
- Schedule heavy analytics during off-peak hours

### Security:
- Enable 2FA for all admin users
- Regularly review audit trail
- Use temporary access for contractors
- Implement tenant isolation for multi-org

### Organization:
- Use version control before major changes
- Tag important dashboard versions
- Document reasons for temp access grants
- Maintain clear tenant naming conventions

---

## 📚 Related Documentation

- [Scheduled Reports & Branding Guide](SCHEDULED-REPORTS-BRANDING-GUIDE.md)
- [Multi-Tenancy & Advanced User Management Guide](MULTI-TENANCY-ADVANCED-USER-MANAGEMENT-GUIDE.md)
- [Dashboard Version Control Guide](DASHBOARD-VERSION-CONTROL-GUIDE.md)
- [Multiple Data Sources Guide](MULTIPLE-DATA-SOURCES-GUIDE.md)
- [ETL Pipeline Guide](ETL-PIPELINE-GUIDE.md)
- [Advanced Analytics Guide](ADVANCED-ANALYTICS-GUIDE.md)

---

## ❓ Troubleshooting

### Can't access admin panel?
- Ensure you're logged in at `/login`
- Check auth token in browser storage
- Default password is `admin123`

### UI not loading?
- Check browser console for errors
- Verify all services are running (`npm run start:all`)
- Clear browser cache and reload

### Data not appearing?
- Check data source connection
- Verify ETL job status
- Review audit trail for errors

---

**Built with Angular 17** | **Last Updated:** November 2024

