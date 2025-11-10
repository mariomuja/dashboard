-- Direct seed script for Neon Console
-- Copy and paste this into Neon SQL Editor: https://console.neon.tech

-- 1. Clear existing data
DELETE FROM kpi_values;
DELETE FROM kpis;
DELETE FROM dashboards;
DELETE FROM sessions;
DELETE FROM users WHERE username = 'demo';

-- 2. Create demo user
INSERT INTO users (id, username, email, password_hash, name, role)
VALUES ('demo-user-id', 'demo', 'demo@kpidashboard.com', '$2a$10$demohashdemohashdemohashdemohashdemohashdemoha', 'Demo User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 3. Create demo dashboard
INSERT INTO dashboards (id, name, description, user_id, is_default)
VALUES ('demo-dashboard-id', 'Main Dashboard', 'Primary KPI dashboard', 'demo-user-id', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create KPIs
INSERT INTO kpis (id, dashboard_id, name, description, unit, target_value, frequency, color, display_order)
VALUES 
  ('kpi-revenue', 'demo-dashboard-id', 'Total Revenue', 'Total revenue across all products', 'currency', 150000, 'daily', '#4CAF50', 0),
  ('kpi-users', 'demo-dashboard-id', 'Active Users', 'Number of active users', 'number', 10000, 'daily', '#2196F3', 1),
  ('kpi-conversion', 'demo-dashboard-id', 'Conversion Rate', 'Percentage of visitors who convert', 'percentage', 5.0, 'daily', '#FF9800', 2),
  ('kpi-satisfaction', 'demo-dashboard-id', 'Customer Satisfaction', 'Average customer satisfaction score', 'rating', 4.5, 'daily', '#9C27B0', 3)
ON CONFLICT (id) DO NOTHING;

-- 5. Create KPI values for last 7 days
-- Day 1 (7 days ago)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '7 days', 122500),
  ('kpi-users', NOW() - INTERVAL '7 days', 8250),
  ('kpi-conversion', NOW() - INTERVAL '7 days', 3.15),
  ('kpi-satisfaction', NOW() - INTERVAL '7 days', 4.65);

-- Day 2 (6 days ago)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '6 days', 124300),
  ('kpi-users', NOW() - INTERVAL '6 days', 8420),
  ('kpi-conversion', NOW() - INTERVAL '6 days', 3.28),
  ('kpi-satisfaction', NOW() - INTERVAL '6 days', 4.72);

-- Day 3 (5 days ago)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '5 days', 126100),
  ('kpi-users', NOW() - INTERVAL '5 days', 8590),
  ('kpi-conversion', NOW() - INTERVAL '5 days', 3.42),
  ('kpi-satisfaction', NOW() - INTERVAL '5 days', 4.68);

-- Day 4 (4 days ago)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '4 days', 123800),
  ('kpi-users', NOW() - INTERVAL '4 days', 8350),
  ('kpi-conversion', NOW() - INTERVAL '4 days', 3.19),
  ('kpi-satisfaction', NOW() - INTERVAL '4 days', 4.75);

-- Day 5 (3 days ago)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '3 days', 127400),
  ('kpi-users', NOW() - INTERVAL '3 days', 8680),
  ('kpi-conversion', NOW() - INTERVAL '3 days', 3.55),
  ('kpi-satisfaction', NOW() - INTERVAL '3 days', 4.81);

-- Day 6 (2 days ago)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '2 days', 125900),
  ('kpi-users', NOW() - INTERVAL '2 days', 8510),
  ('kpi-conversion', NOW() - INTERVAL '2 days', 3.38),
  ('kpi-satisfaction', NOW() - INTERVAL '2 days', 4.73);

-- Day 7 (yesterday)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW() - INTERVAL '1 day', 128600),
  ('kpi-users', NOW() - INTERVAL '1 day', 8750),
  ('kpi-conversion', NOW() - INTERVAL '1 day', 3.67),
  ('kpi-satisfaction', NOW() - INTERVAL '1 day', 4.78);

-- Day 8 (today - current values)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
  ('kpi-revenue', NOW(), 125430),
  ('kpi-users', NOW(), 8432),
  ('kpi-conversion', NOW(), 3.24),
  ('kpi-satisfaction', NOW(), 4.80);

-- Verify the data
SELECT 'Users created:' as info, COUNT(*) as count FROM users WHERE username = 'demo'
UNION ALL
SELECT 'Dashboards created:', COUNT(*) FROM dashboards WHERE id = 'demo-dashboard-id'
UNION ALL
SELECT 'KPIs created:', COUNT(*) FROM kpis
UNION ALL
SELECT 'KPI values created:', COUNT(*) FROM kpi_values;

-- Show latest KPI values
SELECT 
  k.name,
  kv.value,
  kv.timestamp
FROM kpi_values kv
JOIN kpis k ON k.id = kv.kpi_id
WHERE kv.timestamp = (
  SELECT MAX(timestamp) FROM kpi_values WHERE kpi_id = kv.kpi_id
)
ORDER BY k.display_order;

