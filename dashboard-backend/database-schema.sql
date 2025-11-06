-- Session-Based Demo Isolation Schema for KPI Dashboard

CREATE TABLE IF NOT EXISTS demo_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS demo_dashboard_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    data_key VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demo_sessions_expires ON demo_sessions(expires_at);
CREATE INDEX idx_demo_dashboard_session ON demo_dashboard_data(session_id);

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

CREATE OR REPLACE FUNCTION initialize_demo_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO demo_dashboard_data (session_id, data_key, period_type, data) VALUES
    (p_session_id, 'kpi', 'week', '{"currentWeek": [12500, 13200, 14100, 13800, 15200, 16100, 14500], "lastWeek": [11800, 12400, 13100, 12900, 14300, 15200, 13700]}'::jsonb),
    (p_session_id, 'kpi', 'month', '{"currentMonth": [45000, 48000, 52000, 54000, 58000, 62000], "lastMonth": [42000, 45000, 49000, 51000, 55000, 59000]}'::jsonb),
    (p_session_id, 'kpi', 'year', '{"currentYear": [520000, 545000, 570000, 595000, 620000, 645000, 670000, 695000, 720000, 745000, 770000, 795000], "lastYear": [480000, 505000, 530000, 555000, 580000, 605000, 630000, 655000, 680000, 705000, 730000, 755000]}'::jsonb),
    (p_session_id, 'revenue', 'week', '{"currentWeek": [45000, 48000, 52000, 54000, 58000, 62000, 56000], "lastWeek": [42000, 45000, 49000, 51000, 55000, 59000, 53000]}'::jsonb),
    (p_session_id, 'sales', 'week', '{"currentWeek": [850, 920, 1050, 980, 1120, 1200, 1080], "lastWeek": [780, 850, 980, 910, 1050, 1130, 1010]}'::jsonb),
    (p_session_id, 'conversion', 'week', '{"currentWeek": [2.8, 3.1, 3.4, 3.2, 3.6, 3.9, 3.5], "lastWeek": [2.5, 2.8, 3.1, 2.9, 3.3, 3.6, 3.2]}'::jsonb);
END;
$$ LANGUAGE plpgsql;

