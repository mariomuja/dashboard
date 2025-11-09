-- Seed Data for KPI Dashboard Demo

-- Insert Demo User
INSERT INTO users (username, email, display_name, roles, is_active) VALUES
('demo', 'demo@example.com', 'Demo User', ARRAY['user', 'admin'], true)
ON CONFLICT (username) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  roles = EXCLUDED.roles,
  updated_at = NOW();

-- Insert Demo Dashboard (using user ID from above)
WITH demo_user AS (
  SELECT id FROM users WHERE username = 'demo'
)
INSERT INTO dashboards (name, description, owner_id, layout, is_public, is_active)
SELECT 'Executive Dashboard', 'High-level KPIs and metrics', demo_user.id, '[]'::JSONB, true, true
FROM demo_user
ON CONFLICT DO NOTHING;

-- Insert Demo Data Source
INSERT INTO data_sources (name, type, connection_string, is_active) VALUES
('Bookkeeping Integration', 'api', 'https://international-bookkeeping.vercel.app/api', true)
ON CONFLICT (name) DO UPDATE SET 
  connection_string = EXCLUDED.connection_string,
  updated_at = NOW();

-- Insert Demo KPIs
WITH demo_dashboard AS (
  SELECT id FROM dashboards WHERE name = 'Executive Dashboard' LIMIT 1
)
INSERT INTO kpis (dashboard_id, name, description, data_source, unit, display_format, is_active)
SELECT demo_dashboard.id, 'Total Revenue', 'Year-to-date revenue', 'bookkeeping', 'USD', 'currency', true FROM demo_dashboard
UNION ALL
SELECT demo_dashboard.id, 'Active Users', 'Number of active users', 'internal', 'users', 'number', true FROM demo_dashboard
UNION ALL
SELECT demo_dashboard.id, 'Profit Margin', 'Net profit as percentage of revenue', 'calculated', '%', 'percentage', true FROM demo_dashboard
ON CONFLICT DO NOTHING;

-- Insert Sample KPI Values (last 30 days)
WITH kpi_revenue AS (
  SELECT id FROM kpis WHERE name = 'Total Revenue' LIMIT 1
),
kpi_users AS (
  SELECT id FROM kpis WHERE name = 'Active Users' LIMIT 1
),
kpi_margin AS (
  SELECT id FROM kpis WHERE name = 'Profit Margin' LIMIT 1
)
INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  kpi_revenue.id,
  NOW() - (i || ' days')::INTERVAL,
  50000 + (random() * 10000)
FROM generate_series(30, 0, -1) AS i, kpi_revenue
UNION ALL
SELECT 
  kpi_users.id,
  NOW() - (i || ' days')::INTERVAL,
  100 + (random() * 50)
FROM generate_series(30, 0, -1) AS i, kpi_users
UNION ALL
SELECT 
  kpi_margin.id,
  NOW() - (i || ' days')::INTERVAL,
  15 + (random() * 10)
FROM generate_series(30, 0, -1) AS i, kpi_margin
ON CONFLICT DO NOTHING;


