// Seed endpoint - call this via browser or curl to seed the database
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to run seeding.' });
  }

  const pool = getPool();
  const results = [];
  
  try {
    // Step 1: Insert Demo User
    results.push('Inserting demo user...');
    await pool.query(`
      INSERT INTO users (id, username, email, display_name, roles, is_active) 
      VALUES ('11111111-1111-1111-1111-111111111111', 'demo', 'demo@kpi-dashboard.com', 'Demo User', ARRAY['user', 'admin'], true)
      ON CONFLICT (username) DO NOTHING
    `);
    results.push('✅ User created');

    // Step 2: Insert Dashboard
    results.push('Inserting dashboard...');
    await pool.query(`
      INSERT INTO dashboards (id, name, description, owner_id, layout, is_public, is_active)
      VALUES ('22222222-2222-2222-2222-222222222222', 'Executive Dashboard', 'High-level KPIs and metrics', '11111111-1111-1111-1111-111111111111', '[]'::JSONB, true, true)
      ON CONFLICT (id) DO NOTHING
    `);
    results.push('✅ Dashboard created');

    // Step 3: Insert 4 KPIs
    results.push('Inserting KPIs...');
    await pool.query(`
      INSERT INTO kpis (id, dashboard_id, name, description, unit, display_format, is_active)
      VALUES 
      ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Total Revenue', 'Year-to-date total revenue', 'USD', 'currency', true),
      ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Active Users', 'Number of active users', 'users', 'number', true),
      ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Conversion Rate', 'Conversion percentage', '%', 'percentage', true),
      ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Customer Satisfaction', 'Average satisfaction score', '/5', 'rating', true)
      ON CONFLICT (id) DO NOTHING
    `);
    results.push('✅ 4 KPIs created');

    // Step 4: Insert KPI Values
    results.push('Inserting KPI values...');
    await pool.query(`
      INSERT INTO kpi_values (kpi_id, timestamp, value) VALUES
      ('44444444-4444-4444-4444-444444444444', NOW(), 125430),
      ('44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 week', 118200),
      ('55555555-5555-5555-5555-555555555555', NOW(), 8432),
      ('55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 week', 7895),
      ('66666666-6666-6666-6666-666666666666', NOW(), 3.24),
      ('66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 week', 3.45),
      ('77777777-7777-7777-7777-777777777777', NOW(), 4.8),
      ('77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 week', 4.75)
      ON CONFLICT DO NOTHING
    `);
    results.push('✅ 8 KPI values inserted');

    // Step 5: Verify
    results.push('Verifying data...');
    const countResult = await pool.query(`
      SELECT k.name, COUNT(*) as value_count
      FROM kpis k
      JOIN kpi_values kv ON k.id = kv.kpi_id
      GROUP BY k.name
      ORDER BY k.name
    `);

    const latestValues = await pool.query(`
      WITH latest AS (
        SELECT DISTINCT ON (k.name)
          k.name,
          kv.value,
          k.display_format
        FROM kpis k
        JOIN kpi_values kv ON k.id = kv.kpi_id
        ORDER BY k.name, kv.timestamp DESC
      )
      SELECT * FROM latest ORDER BY name
    `);

    results.push('✅ Data verified');

    const summary = latestValues.rows.map(row => {
      let formattedValue = row.value;
      if (row.display_format === 'currency') {
        formattedValue = `$${parseFloat(row.value).toLocaleString('en-US')}`;
      } else if (row.display_format === 'percentage') {
        formattedValue = `${row.value}%`;
      } else if (row.display_format === 'rating') {
        formattedValue = `${row.value}/5`;
      } else {
        formattedValue = Math.round(parseFloat(row.value)).toLocaleString('en-US');
      }
      return { name: row.name, value: formattedValue };
    });

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      steps: results,
      kpiCounts: countResult.rows,
      latestValues: summary,
      nextStep: 'Visit your dashboard and hard refresh (Ctrl+F5)'
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return res.status(500).json({
      success: false,
      error: 'Seeding failed',
      message: error.message,
      steps: results
    });
  }
};


