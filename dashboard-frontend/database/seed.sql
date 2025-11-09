-- Seed Data for KPI Dashboard Demo

-- Insert Demo User
INSERT INTO users (id, username, email, display_name, roles, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'demo', 'demo@kpi-dashboard.com', 'Demo User', ARRAY['user', 'admin'], true)
ON CONFLICT (username) DO UPDATE SET 
  id = EXCLUDED.id,
  display_name = EXCLUDED.display_name,
  roles = EXCLUDED.roles,
  updated_at = NOW();

-- Insert Demo Dashboard (using fixed user ID)
INSERT INTO dashboards (id, name, description, owner_id, layout, is_public, is_active)
VALUES ('22222222-2222-2222-2222-222222222222', 'Executive Dashboard', 'High-level KPIs and metrics for business performance', '11111111-1111-1111-1111-111111111111', '[]'::JSONB, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert Demo Data Source
INSERT INTO data_sources (id, name, type, connection_string, is_active) VALUES
('33333333-3333-3333-3333-333333333333', 'Bookkeeping Integration', 'api', 'https://international-bookkeeping.vercel.app/api', true)
ON CONFLICT (name) DO UPDATE SET 
  connection_string = EXCLUDED.connection_string,
  updated_at = NOW();

-- Insert Demo KPIs with fixed IDs
INSERT INTO kpis (id, dashboard_id, name, description, data_source, unit, display_format, refresh_interval, is_active)
VALUES 
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Total Revenue', 'Year-to-date total revenue from all sources', 'bookkeeping', 'USD', 'currency', 300, true),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Active Users', 'Number of currently active users in the system', 'internal', 'users', 'number', 300, true),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Conversion Rate', 'Percentage of visitors who complete desired actions', 'analytics', '%', 'percentage', 300, true),
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Customer Satisfaction', 'Average customer satisfaction score', 'surveys', '/5', 'rating', 300, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Clear old KPI values
DELETE FROM kpi_values WHERE kpi_id IN (
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777'
);

-- Insert Sample KPI Values (last 30 days) for Total Revenue
INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  '44444444-4444-4444-4444-444444444444'::UUID,
  NOW() - (i || ' days')::INTERVAL,
  125430 + (random() * 15000 - 7500)
FROM generate_series(30, 0, -1) AS i;

-- Insert Sample KPI Values for Active Users
INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  '55555555-5555-5555-5555-555555555555'::UUID,
  NOW() - (i || ' days')::INTERVAL,
  8432 + (random() * 1000 - 500)
FROM generate_series(30, 0, -1) AS i;

-- Insert Sample KPI Values for Conversion Rate
INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  '66666666-6666-6666-6666-666666666666'::UUID,
  NOW() - (i || ' days')::INTERVAL,
  3.24 + (random() * 1.5 - 0.75)
FROM generate_series(30, 0, -1) AS i;

-- Insert Sample KPI Values for Customer Satisfaction
INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  '77777777-7777-7777-7777-777777777777'::UUID,
  NOW() - (i || ' days')::INTERVAL,
  4.8 + (random() * 0.3 - 0.15)
FROM generate_series(30, 0, -1) AS i;

-- Insert Sample Audit Trail Entries
INSERT INTO audit_trail (user_id, username, action, entity_type, entity_id, description, ip_address, timestamp)
VALUES 
('11111111-1111-1111-1111-111111111111', 'demo', 'LOGIN', 'USER', '11111111-1111-1111-1111-111111111111', 'User logged in successfully', '192.168.1.100', NOW() - INTERVAL '2 hours'),
('11111111-1111-1111-1111-111111111111', 'demo', 'VIEW', 'DASHBOARD', '22222222-2222-2222-2222-222222222222', 'Viewed Executive Dashboard', '192.168.1.100', NOW() - INTERVAL '1 hour 50 minutes'),
('11111111-1111-1111-1111-111111111111', 'demo', 'CREATE', 'KPI', '44444444-4444-4444-4444-444444444444', 'Created Total Revenue KPI', '192.168.1.100', NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111111', 'demo', 'UPDATE', 'KPI', '55555555-5555-5555-5555-555555555555', 'Updated Active Users KPI configuration', '192.168.1.100', NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;
