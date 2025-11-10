# Vercel Database Setup Guide

## Problem
The dashboard database is not reachable because DATABASE_URL is not configured in Vercel.

## Solution: Configure DATABASE_URL in Vercel

### Step 1: Get your Neon Database URL

1. Go to **https://console.neon.tech**
2. Select your **Dashboard project** (or create one if needed)
3. Click on **"Connection Details"** or **"Dashboard"**
4. Copy the **Connection String** (it looks like):
   ```
   postgresql://[username]:[password]@[host]/[database]?sslmode=require
   ```

### Step 2: Add DATABASE_URL to Vercel

1. Go to **https://vercel.com**
2. Select your **kpi-dashboard-eight** project
3. Click on **"Settings"** (top menu)
4. Click on **"Environment Variables"** (left sidebar)
5. Click **"Add New"**
6. Enter:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Environment**: Check all three (Production, Preview, Development)
7. Click **"Save"**

### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click the **three dots** (⋯) menu
4. Select **"Redeploy"**

OR simply push a new commit:
```bash
cd C:\Users\mario\dashboard
git commit --allow-empty -m "Trigger redeploy with DATABASE_URL"
git push origin main
```

### Step 4: Test the Database Connection

After redeployment, test if the database is reachable:

1. Visit: **https://kpi-dashboard-eight.vercel.app/api/health/database**
2. You should see:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "tables": ["users", "dashboards", "kpis", ...]
   }
   ```

If you see errors, check:
- DATABASE_URL is correctly formatted
- Neon database is not paused
- IP restrictions are not blocking Vercel

### Step 5: Seed the Database

Once DATABASE_URL is configured, you can seed via:

**Option A: Via curl**
```bash
curl -X POST https://kpi-dashboard-eight.vercel.app/api/seed/run
```

**Option B: Via browser**
- Open: https://kpi-dashboard-eight.vercel.app/api/seed/run
- Use browser extension like "Requestly" or "ModHeader" to send POST request

**Option C: Via Neon SQL Editor** (Recommended)
- Go to https://console.neon.tech
- Open SQL Editor
- Run the SQL from `dashboard-frontend/database/quick-seed.sql`

## Verify Setup

After seeding, check:

1. **API returns data**:
   ```bash
   curl https://kpi-dashboard-eight.vercel.app/api/data/dashboard-data
   ```
   Should show KPI data (not empty)

2. **Dashboard displays KPIs**:
   - Visit: https://kpi-dashboard-eight.vercel.app
   - Hard refresh: Ctrl+F5
   - Should show: $125,430, 8,432, 3.24%, 4.8/5

## Common Issues

### "Connection refused" or "ECONNREFUSED"
- DATABASE_URL is not set in Vercel
- Follow Step 2 above

### "Database does not exist"
- Wrong database name in connection string
- Create the database in Neon first

### "SSL required"
- Add `?sslmode=require` to the end of DATABASE_URL

### "Tables do not exist"
- Run `dashboard-frontend/database/schema.sql` in Neon SQL Editor first
- Then run seed script

## Current Status Check

Run these in Vercel logs to see errors:

1. Go to Vercel project → Logs
2. Filter by "error" or "database"
3. Look for connection errors

## Need Help?

If still not working:
1. Share the error from Vercel logs
2. Confirm DATABASE_URL is set in Vercel Environment Variables
3. Test `/api/health/database` endpoint


