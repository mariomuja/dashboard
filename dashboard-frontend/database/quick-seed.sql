-- Quick Seed Script for Dashboard KPIs
-- Run this directly in Neon SQL Editor: https://console.neon.tech

-- Step 1: Delete existing data (optional - only if reseeding)
-- DELETE FROM kpi_values;
-- DELETE FROM kpis;
-- DELETE FROM dashboards;
-- DELETE FROM users WHERE username = 'demo';

-- Step 2: Insert Demo User
INSERT INTO users (id, username, email, display_name, roles, is_active) 
VALUES ('11111111-1111-1111-1111-111111111111', 'demo', 'demo@kpi-dashboard.com', 'Demo User', ARRAY['user', 'admin'], true)
ON CONFLICT (username) DO NOTHING;

-- Step 3: Insert Dashboard
INSERT INTO dashboards (id, name, description, owner_id, layout, is_public, is_active)
VALUES ('22222222-2222-2222-2222-222222222222', 'Executive Dashboard', 'High-level KPIs and metrics', '11111111-1111-1111-1111-111111111111', '[]'::JSONB, true, true)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert 4 KPIs
INSERT INTO kpis (id, dashboard_id, name, description, unit, display_format, is_active)
VALUES 
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Total Revenue', 'Year-to-date total revenue', 'USD', 'currency', true),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Active Users', 'Number of active users', 'users', 'number', true),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Conversion Rate', 'Conversion percentage', '%', 'percentage', true),
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Customer Satisfaction', 'Average satisfaction score', '/5', 'rating', true)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Insert KPI Values (current values only for quick fix)
INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
-- Total Revenue: $125,430
('44444444-4444-4444-4444-444444444444', NOW(), 125430),
('44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 week', 118200),

-- Active Users: 8,432
('55555555-5555-5555-5555-555555555555', NOW(), 8432),
('55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 week', 7895),

-- Conversion Rate: 3.24%
('66666666-6666-6666-6666-666666666666', NOW(), 3.24),
('66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 week', 3.45),

-- Customer Satisfaction: 4.8/5
('77777777-7777-7777-7777-777777777777', NOW(), 4.8),
('77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 week', 4.75)
ON CONFLICT DO NOTHING;

-- Step 6: Verify the data
SELECT 
  k.name,
  kv.value,
  kv.timestamp
FROM kpis k
JOIN kpi_values kv ON k.id = kv.kpi_id
ORDER BY k.created_at, kv.timestamp DESC;

-- You should see 4 KPIs with 2 values each (8 rows total)



