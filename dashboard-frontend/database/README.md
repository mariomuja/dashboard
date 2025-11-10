# Database Seed Instructions

## To seed the Dashboard database:

1. Connect to your Neon PostgreSQL database
2. Run the schema first:
   ```bash
   psql $DATABASE_URL < schema.sql
   ```
3. Run the seed data:
   ```bash
   psql $DATABASE_URL < seed.sql
   ```

## What the seed data includes:

- **Demo User**: username `demo`, with admin and user roles
- **Executive Dashboard**: A sample dashboard with 4 KPIs
- **4 KPIs**:
  - Total Revenue (currency format)
  - Active Users (number format)
  - Conversion Rate (percentage format)
  - Customer Satisfaction (rating format)
- **KPI Values**: 31 days of historical data for each KPI
- **Data Source**: Integration with Bookkeeping app
- **Audit Trail**: Sample audit log entries

## Fixed IDs used:

- User: `11111111-1111-1111-1111-111111111111`
- Dashboard: `22222222-2222-2222-2222-222222222222`
- Data Source: `33333333-3333-3333-3333-333333333333`
- KPI 1 (Revenue): `44444444-4444-4444-4444-444444444444`
- KPI 2 (Users): `55555555-5555-5555-5555-555555555555`
- KPI 3 (Conversion): `66666666-6666-6666-6666-666666666666`
- KPI 4 (Satisfaction): `77777777-7777-7777-7777-777777777777`

## Verifying the data:

```sql
-- Check if KPIs exist
SELECT id, name FROM kpis;

-- Check if KPI values exist
SELECT kpi_id, COUNT(*) FROM kpi_values GROUP BY kpi_id;

-- View latest KPI values
SELECT k.name, kv.value, kv.timestamp 
FROM kpis k 
JOIN kpi_values kv ON k.id = kv.kpi_id 
ORDER BY kv.timestamp DESC 
LIMIT 10;
```

## Re-seeding:

The seed script uses `ON CONFLICT` clauses, so you can run it multiple times safely. To completely reset:

```sql
TRUNCATE TABLE kpi_values CASCADE;
TRUNCATE TABLE kpis CASCADE;
TRUNCATE TABLE dashboards CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE audit_trail CASCADE;
TRUNCATE TABLE data_sources CASCADE;
TRUNCATE TABLE users CASCADE;
```

Then run the seed script again.



