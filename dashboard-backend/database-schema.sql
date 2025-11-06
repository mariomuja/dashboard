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
    source_app VARCHAR(100) NOT NULL,  -- 'bookkeeping', 'crm', 'inventory', etc.
    source_app_display VARCHAR(255) NOT NULL,  -- 'International Bookkeeping', 'CRM System', etc.
    kpi_name VARCHAR(255) NOT NULL,
    kpi_value DECIMAL(15,2),
    kpi_unit VARCHAR(50),  -- '$', '%', 'count', etc.
    kpi_change DECIMAL(5,2),  -- percentage change
    kpi_icon VARCHAR(50),
    kpi_color VARCHAR(20),  -- 'green', 'red', 'blue', etc.
    chart_type VARCHAR(50),  -- 'line', 'bar', 'pie', 'gauge', null
    chart_data JSONB,  -- Chart configuration and data
    description TEXT,
    category VARCHAR(100),  -- 'financial', 'operational', 'sales', etc.
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
