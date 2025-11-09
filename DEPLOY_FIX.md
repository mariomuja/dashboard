# Dashboard NaN Fix - Deployment Guide

## Problem
KPIs showing "NaN" in the deployed dashboard because the Neon database is empty.

## Solution
Load seed data into the Neon PostgreSQL database.

## Steps to Fix:

### Option 1: Quick Fix (5 minutes)
Use the minimal seed script:

1. Go to https://console.neon.tech
2. Select your dashboard project
3. Click on "SQL Editor"
4. Copy and paste the contents of `dashboard-frontend/database/quick-seed.sql`
5. Click "Run"
6. Verify:
   ```sql
   SELECT k.name, COUNT(*) as value_count 
   FROM kpis k 
   JOIN kpi_values kv ON k.id = kv.kpi_id 
   GROUP BY k.name;
   ```
   Should show 4 KPIs with at least 2 values each.

7. Refresh your dashboard at https://kpi-dashboard-eight.vercel.app
8. KPIs should now show:
   - Total Revenue: $125,430
   - Active Users: 8,432
   - Conversion Rate: 3.24%
   - Customer Satisfaction: 4.8/5

### Option 2: Full Seed Data (10 minutes)
Use the complete seed script with 31 days of historical data:

1. Go to https://console.neon.tech
2. Select your dashboard project  
3. Click on "SQL Editor"
4. Copy and paste the contents of `dashboard-frontend/database/seed.sql`
5. Click "Run"
6. This will create:
   - 1 Demo User
   - 1 Dashboard
   - 4 KPIs
   - 124 KPI Values (31 days × 4 KPIs)
   - Sample audit trail

### Option 3: Command Line (psql)
If you have psql installed:

```bash
# Get your DATABASE_URL from Neon dashboard
export DATABASE_URL="postgresql://..."

# Quick fix
psql $DATABASE_URL < dashboard-frontend/database/quick-seed.sql

# OR Full data
psql $DATABASE_URL < dashboard-frontend/database/seed.sql
```

## Verification

After running the seed script, verify in SQL Editor:

```sql
-- Check KPIs exist
SELECT id, name, display_format FROM kpis;

-- Check values exist
SELECT 
  k.name,
  COUNT(*) as num_values,
  MAX(kv.value) as latest_value
FROM kpis k
LEFT JOIN kpi_values kv ON k.id = kv.kpi_id
GROUP BY k.name;
```

Expected output:
```
name                    | num_values | latest_value
-----------------------|------------|-------------
Total Revenue          | 2-31       | ~125430
Active Users           | 2-31       | ~8432
Conversion Rate        | 2-31       | ~3.24
Customer Satisfaction  | 2-31       | ~4.8
```

## Troubleshooting

### Still seeing NaN after seeding?

1. **Check API logs** in Vercel:
   - Go to https://vercel.com/mariomuja/kpi-dashboard-eight
   - Click "Logs"
   - Look for "[Dashboard Data]" logs
   - Should see "Fetched X KPIs with values from database"

2. **Check browser console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors in API calls to `/api/data/dashboard-data`

3. **Verify DATABASE_URL environment variable**:
   - Go to Vercel project settings
   - Check "Environment Variables"
   - Ensure `DATABASE_URL` is set correctly for Production

4. **Test API directly**:
   ```bash
   curl https://kpi-dashboard-eight.vercel.app/api/data/dashboard-data
   ```
   Should return JSON with kpi.week array containing 4 objects with value properties.

### Database Connection Issues?

The API has fallback logic:
- If database is unavailable, it returns demo data
- If KPIs exist but have no values, it returns "0" instead of NaN
- If network fails, frontend uses `assets/data/dashboard-data.json`

Check Vercel logs for:
- "Database query failed, using fallback data"
- "Using fallback demo data"

## After Fix

Once data is seeded:
- KPIs will show real values from database
- Values will have proper formatting (currency, percentage, etc.)
- Trend arrows will show based on week-over-week comparison
- Charts will populate with time-series data

## Need Help?

If still seeing NaN after following these steps:
1. Share Vercel deployment logs
2. Share browser console errors
3. Run verification queries and share output

