# 🚀 Deployment Guide - KPI Dashboard & Bookkeeping Integration

## Prerequisites
- Render account (for backends and PostgreSQL)
- Vercel account (for frontends)
- Git repositories pushed to GitHub

---

## Step 1: PostgreSQL Setup on Render

### 1.1 Create PostgreSQL Database for Dashboard

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `kpi-dashboard-db`
   - **Database**: `kpi_dashboard`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: `Free` (for testing)
4. Click **"Create Database"**
5. Wait for provisioning (~2 minutes)
6. Copy the **Internal Database URL** (starts with `postgresql://`)

### 1.2 Run Dashboard Database Schema

**Option A: Using Render's psql Console**
1. In your database dashboard, click **"Connect"** → **"External Connection"**
2. Copy the `psql` command
3. Open your local terminal and run the copied command
4. Once connected, paste this SQL:

```sql
-- Session-Based Demo Isolation Schema for KPI Dashboard
-- Enhanced with External Application KPI Integration

-- Demo Sessions Table
CREATE TABLE IF NOT EXISTS demo_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Dashboard Data (KPIs)
CREATE TABLE IF NOT EXISTS demo_dashboard_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    data_key VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- External Application KPIs (NEW - receives KPIs from other apps)
CREATE TABLE IF NOT EXISTS external_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    source_app VARCHAR(100) NOT NULL,
    source_app_display VARCHAR(255) NOT NULL,
    kpi_name VARCHAR(255) NOT NULL,
    kpi_value DECIMAL(15,2),
    kpi_unit VARCHAR(50),
    kpi_change DECIMAL(5,2),
    kpi_icon VARCHAR(50),
    kpi_color VARCHAR(20),
    chart_type VARCHAR(50),
    chart_data JSONB,
    description TEXT,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_demo_sessions_expires ON demo_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_demo_dashboard_session ON demo_dashboard_data(session_id);
CREATE INDEX IF NOT EXISTS idx_external_kpis_session ON external_kpis(session_id);
CREATE INDEX IF NOT EXISTS idx_external_kpis_source ON external_kpis(source_app);
CREATE INDEX IF NOT EXISTS idx_external_kpis_active ON external_kpis(is_active);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM demo_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Enhanced session initialization with sample external KPIs
CREATE OR REPLACE FUNCTION initialize_demo_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Insert default KPI data
    INSERT INTO demo_dashboard_data (session_id, data_key, period_type, data) VALUES
    (p_session_id, 'kpi', 'week', '{"currentWeek": [12500, 13200, 14100, 13800, 15200, 16100, 14500], "lastWeek": [11800, 12400, 13100, 12900, 14300, 15200, 13700]}'::jsonb),
    (p_session_id, 'kpi', 'month', '{"currentMonth": [45000, 48000, 52000, 54000, 58000, 62000], "lastMonth": [42000, 45000, 49000, 51000, 55000, 59000]}'::jsonb),
    (p_session_id, 'revenue', 'week', '{"currentWeek": [45000, 48000, 52000, 54000, 58000, 62000, 56000], "lastWeek": [42000, 45000, 49000, 51000, 55000, 59000, 53000]}'::jsonb),
    (p_session_id, 'sales', 'week', '{"currentWeek": [850, 920, 1050, 980, 1120, 1200, 1080], "lastWeek": [780, 850, 980, 910, 1050, 1130, 1010]}'::jsonb);

    -- Insert sample external KPIs from Bookkeeping App
    INSERT INTO external_kpis (
        session_id, source_app, source_app_display, kpi_name, kpi_value, 
        kpi_unit, kpi_change, kpi_icon, kpi_color, category, display_order, description
    ) VALUES
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Total Assets', 32000.00, '$', 12.5, '💰', 'blue', 'financial', 1, 'Total assets from bookkeeping system'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Net Income', 32000.00, '$', 15.3, '📈', 'green', 'financial', 2, 'Net income (Revenue - Expenses)'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Total Revenue', 55000.00, '$', 18.2, '💵', 'green', 'financial', 3, 'Year-to-date revenue'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Total Expenses', 23000.00, '$', -5.1, '💸', 'red', 'financial', 4, 'Year-to-date expenses'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Cash Balance', 32000.00, '$', 8.7, '💵', 'blue', 'financial', 5, 'Current cash account balance'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Accounts Receivable', 0.00, '$', 0.0, '📥', 'gray', 'financial', 6, 'Outstanding receivables'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Accounts Payable', 0.00, '$', 0.0, '📤', 'gray', 'financial', 7, 'Outstanding payables'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Journal Entries', 4.00, 'count', 0.0, '📝', 'blue', 'operational', 8, 'Total journal entries recorded'),
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Active Accounts', 10.00, 'count', 0.0, '📊', 'blue', 'operational', 9, 'Number of active accounts');

    -- Insert sample chart for Revenue Trend from Bookkeeping
    INSERT INTO external_kpis (
        session_id, source_app, source_app_display, kpi_name, 
        chart_type, chart_data, category, display_order, description
    ) VALUES
    (p_session_id, 'bookkeeping', 'International Bookkeeping', 'Revenue Trend',
     'line', 
     '{"labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], "datasets": [{"label": "Revenue", "data": [45000, 48000, 52000, 54000, 58000, 62000], "borderColor": "#10b981", "backgroundColor": "rgba(16, 185, 129, 0.1)"}]}'::jsonb,
     'financial', 10, 'Monthly revenue trend from bookkeeping system');
END;
$$ LANGUAGE plpgsql;
```

5. Type `\q` to exit psql

**Option B: Using SQL File Upload**
1. In database dashboard, find **"Execute SQL"** or similar
2. Upload `dashboard-backend/database-schema.sql`
3. Click "Execute"

### 1.3 Create PostgreSQL Database for Bookkeeping

Repeat the process for bookkeeping:
1. Create new PostgreSQL database: `bookkeeping-db`
2. Database name: `bookkeeping`
3. Copy the **Internal Database URL**
4. Connect via psql (use the schema from the bookkeeping repository)

---

## Step 2: Deploy Dashboard Backend on Render

### 2.1 Create Web Service

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `mariomuja/dashboard`
4. Configure:
   - **Name**: `kpi-dashboard-backend`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `dashboard-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`

### 2.2 Environment Variables

Add these environment variables:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = **(Paste Internal Database URL from Step 1.1)**
- `CORS_ORIGIN` = `https://kpi-dashboard.vercel.app` *(update after Vercel deploy)*

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. Copy the **service URL** (e.g., `https://kpi-dashboard-backend.onrender.com`)

---

## Step 3: Deploy Dashboard Frontend on Vercel

### 3.1 Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import `mariomuja/dashboard` repository
4. Configure:
   - **Project Name**: `kpi-dashboard`
   - **Framework Preset**: `Angular`
   - **Root Directory**: `dashboard-frontend`
   - **Build Command**: `npm install && npm run vercel-build`
   - **Output Directory**: `dist/kpi-dashboard/browser`

### 3.2 Environment Variables

Add these:
- `NG_APP_API_URL` = `https://kpi-dashboard-backend.onrender.com/api` *(from Step 2.3)*

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. Copy the **deployment URL** (e.g., `https://kpi-dashboard.vercel.app`)

### 3.4 Update Backend CORS

Go back to Render dashboard backend:
1. Update `CORS_ORIGIN` environment variable with your Vercel URL
2. Click **"Save Changes"** (will auto-redeploy)

---

## Step 4: Deploy Bookkeeping Backend on Render

### 4.1 Create Web Service

1. **New Web Service** on Render
2. Connect repository: `mariomuja/bookkeeping`
3. Configure:
   - **Name**: `international-bookkeeping-backend`
   - **Root Directory**: `bookkeeping-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`

### 4.2 Environment Variables

- `NODE_ENV` = `production`
- `PORT` = `10000`
- `DATABASE_URL` = **(Bookkeeping database URL from Step 1.3)**
- `CORS_ORIGIN` = `https://international-bookkeeping.vercel.app`
- `DASHBOARD_API_URL` = `https://kpi-dashboard-backend.onrender.com/api` **(from Step 2.3)**
- `ENABLE_KPI_INTEGRATION` = `true`

### 4.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment
3. Copy the service URL

---

## Step 5: Deploy Bookkeeping Frontend on Vercel

### 5.1 Import Project

1. **New Project** on Vercel
2. Import `mariomuja/bookkeeping` repository
3. Configure:
   - **Project Name**: `international-bookkeeping`
   - **Framework**: `Angular`
   - **Root Directory**: `bookkeeping-frontend`
   - **Build Command**: `npm install && npm run vercel-build`
   - **Output Directory**: `dist/bookkeeping-frontend/browser`

### 5.2 Environment Variables

- `NG_APP_API_URL` = `https://international-bookkeeping-backend.onrender.com/api`

### 5.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment
3. Copy deployment URL

### 5.4 Update Backend CORS

Update bookkeeping backend CORS with Vercel URL

---

## Step 6: Test Session Isolation & KPI Integration

### 6.1 Test Bookkeeping App

1. Open: `https://international-bookkeeping.vercel.app`
2. Login with demo credentials:
   - Username: `demo`
   - Password: `DemoUser2025!Secure`
3. Navigate to **Dashboard** page
4. Verify metrics are loading
5. **Check browser console** - should see: `[KPI Sender] Sent 9 KPIs to dashboard`

### 6.2 Test Dashboard App

1. Open: `https://kpi-dashboard.vercel.app`
2. Login with demo credentials
3. Scroll down to **"📡 KPIs from Connected Applications"** section
4. **You should see**:
   - Section header: "Real-time metrics from International Bookkeeping..."
   - 9 KPI cards labeled "from International Bookkeeping"
   - Values like Total Assets ($32,000), Net Income, Revenue, etc.
   - Color-coded percentage changes

### 6.3 Test Session Isolation

**Test A: Separate Sessions**
1. Open bookkeeping in **Browser 1** (normal window)
2. Open bookkeeping in **Browser 2** (incognito)
3. Make different changes in each:
   - Browser 1: Create a journal entry
   - Browser 2: Create a different journal entry
4. Verify changes are **independent** (don't affect each other)

**Test B: Session Persistence**
1. Make changes in bookkeeping
2. Refresh the page
3. Verify changes **persist** (stored in PostgreSQL)

**Test C: Session Expiration**
1. Wait 24 hours OR manually delete session from database
2. Refresh bookkeeping app
3. Should create **new session** with fresh demo data

### 6.4 Test Cross-App KPI Flow

1. **Start fresh**: Clear browser storage, open bookkeeping
2. Login to bookkeeping app
3. Go to Dashboard page (triggers KPI sending)
4. **Copy the session ID** from localStorage (open DevTools → Application → Local Storage)
5. Open dashboard app in **same browser**
6. Login to dashboard
7. **Verify same session ID** in localStorage
8. Dashboard should show KPIs from bookkeeping

---

## 📊 Verification Checklist

- [ ] PostgreSQL databases created and schemas applied
- [ ] Dashboard backend deployed and healthy
- [ ] Dashboard frontend deployed and loads
- [ ] Bookkeeping backend deployed and healthy
- [ ] Bookkeeping frontend deployed and loads
- [ ] Can login to bookkeeping with demo credentials
- [ ] Can login to dashboard with demo credentials
- [ ] Dashboard shows "KPIs from Connected Applications" section
- [ ] Section displays 9 bookkeeping KPIs
- [ ] Each KPI shows source label "from International Bookkeeping"
- [ ] KPIs have correct values and color-coded changes
- [ ] Session isolation works (separate browser windows have separate data)
- [ ] Changes persist after page refresh
- [ ] Both apps auto-deploy on git push

---

## 🎯 Expected Results

### Dashboard App
```
📊 KPI Dashboard
├── Standard KPI cards (your dashboard KPIs)
├── Charts (revenue, sales, conversion)
└── 📡 KPIs from Connected Applications
    └── International Bookkeeping
        ├── 💰 Total Assets: $32,000.00 (+12.5%)
        ├── 📈 Net Income: $32,000.00 (+15.3%)
        ├── 💵 Total Revenue: $55,000.00 (+18.2%)
        ├── 💸 Total Expenses: $23,000.00 (-5.1%)
        ├── 💵 Cash Balance: $32,000.00 (+8.7%)
        ├── 📥 Accounts Receivable: $0.00 (0.0%)
        ├── 📤 Accounts Payable: $0.00 (0.0%)
        ├── 📝 Journal Entries: 4 (0.0%)
        └── 📊 Active Accounts: 10 (0.0%)
```

---

## 🐛 Troubleshooting

### KPIs Not Showing
- Check browser console for errors
- Verify `DASHBOARD_API_URL` in bookkeeping backend
- Verify `ENABLE_KPI_INTEGRATION=true`
- Check Render logs: `render logs <service-name>`

### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URLs exactly
- No trailing slashes in URLs
- Redeploy backend after changing CORS

### Database Connection Errors
- Use **Internal Database URL** for Render services
- External URL only for local development
- Check database is in same region as backend

### Session Not Persisting
- Clear browser cache/storage
- Check PostgreSQL connection
- Verify `DATABASE_URL` is set correctly

---

## 📞 Support

- Email: mario.muja@gmail.com
- Phone: +49 1520 464 1473

**Happy Deploying! 🚀**
