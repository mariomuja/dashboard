// Simple seed script for dashboard database
const { Pool } = require('pg');

// Use the Neon database URL for dashboard
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_T2PupfxKc7Zt@ep-silent-unit-add8qh6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log('🌱 Starting dashboard seed...');
  console.log('📊 Database:', DATABASE_URL.split('@')[1]?.split('/')[1] || 'unknown');
  
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    console.log('1️⃣ Clearing existing KPI data...');
    await client.query('DELETE FROM kpi_values');
    await client.query('DELETE FROM kpis');
    
    console.log('2️⃣ Getting or creating demo dashboard...');
    let dashboardId;
    const existingDashboard = await client.query(`
      SELECT id FROM dashboards WHERE name = 'Main Dashboard' LIMIT 1
    `);
    
    if (existingDashboard.rows.length > 0) {
      dashboardId = existingDashboard.rows[0].id;
      console.log('✓ Using existing dashboard:', dashboardId);
    } else {
      const dashboardResult = await client.query(`
        INSERT INTO dashboards (name, description, layout, is_public, is_active)
        VALUES ('Main Dashboard', 'Primary KPI dashboard', '[]'::jsonb, true, true)
        RETURNING id
      `);
      dashboardId = dashboardResult.rows[0].id;
      console.log('✓ Dashboard created:', dashboardId);
    }
    
    console.log('3️⃣ Creating KPIs...');
    const kpis = [
      {
        name: 'Total Revenue',
        description: 'Total revenue across all products',
        unit: 'currency',
        display_format: '$0,0'
      },
      {
        name: 'Active Users',
        description: 'Number of active users',
        unit: 'number',
        display_format: '0,0'
      },
      {
        name: 'Conversion Rate',
        description: 'Percentage of visitors who convert',
        unit: 'percentage',
        display_format: '0.00%'
      },
      {
        name: 'Customer Satisfaction',
        description: 'Average customer satisfaction score',
        unit: 'rating',
        display_format: '0.0'
      }
    ];
    
    const kpiIds = [];
    for (const kpi of kpis) {
      const result = await client.query(`
        INSERT INTO kpis (dashboard_id, name, description, unit, display_format, refresh_interval, is_active)
        VALUES ($1, $2, $3, $4, $5, 300, true)
        RETURNING id
      `, [dashboardId, kpi.name, kpi.description, kpi.unit, kpi.display_format]);
      
      kpiIds.push({ id: result.rows[0].id, name: kpi.name });
      console.log(`✓ KPI created: ${kpi.name} (${result.rows[0].id})`);
    }
    
    console.log('4️⃣ Creating KPI values for last 7 days...');
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const timestamp = date.toISOString();
      
      // Revenue: 120k - 130k
      const revenue = 120000 + Math.random() * 10000;
      await client.query(`
        INSERT INTO kpi_values (kpi_id, timestamp, value)
        VALUES ($1, $2, $3)
      `, [kpiIds[0].id, timestamp, revenue]);
      
      // Users: 8000 - 9000
      const users = 8000 + Math.random() * 1000;
      await client.query(`
        INSERT INTO kpi_values (kpi_id, timestamp, value)
        VALUES ($1, $2, $3)
      `, [kpiIds[1].id, timestamp, users]);
      
      // Conversion: 3% - 4%
      const conversion = 3 + Math.random();
      await client.query(`
        INSERT INTO kpi_values (kpi_id, timestamp, value)
        VALUES ($1, $2, $3)
      `, [kpiIds[2].id, timestamp, conversion]);
      
      // Satisfaction: 4.5 - 5.0
      const satisfaction = 4.5 + Math.random() * 0.5;
      await client.query(`
        INSERT INTO kpi_values (kpi_id, timestamp, value)
        VALUES ($1, $2, $3)
      `, [kpiIds[3].id, timestamp, satisfaction]);
      
      console.log(`✓ Values for ${date.toISOString().split('T')[0]}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Dashboards: 1');
    console.log('   - KPIs: 4');
    console.log('   - KPI Values: 28 (7 days × 4 KPIs)');
    
    // Verify data
    console.log('\n🔍 Verifying data...');
    const kpiCount = await client.query('SELECT COUNT(*) FROM kpis WHERE dashboard_id = $1', [dashboardId]);
    const valueCount = await client.query(`
      SELECT COUNT(*) FROM kpi_values 
      WHERE kpi_id IN (SELECT id FROM kpis WHERE dashboard_id = $1)
    `, [dashboardId]);
    console.log(`   - KPIs in DB: ${kpiCount.rows[0].count}`);
    console.log(`   - Values in DB: ${valueCount.rows[0].count}`);
    
    // Show latest values
    console.log('\n📈 Latest KPI values:');
    const latest = await client.query(`
      SELECT k.name, kv.value, kv.timestamp, k.unit
      FROM kpi_values kv
      JOIN kpis k ON k.id = kv.kpi_id
      WHERE k.dashboard_id = $1
      AND kv.timestamp = (
        SELECT MAX(timestamp) FROM kpi_values WHERE kpi_id = kv.kpi_id
      )
      ORDER BY k.name
    `, [dashboardId]);
    
    latest.rows.forEach(row => {
      const numValue = parseFloat(row.value);
      let formattedValue = row.value;
      if (row.unit === 'currency') {
        formattedValue = `$${Math.round(numValue).toLocaleString()}`;
      } else if (row.unit === 'percentage') {
        formattedValue = `${numValue.toFixed(2)}%`;
      } else if (row.unit === 'rating') {
        formattedValue = `${numValue.toFixed(1)}/5`;
      } else {
        formattedValue = Math.round(numValue).toLocaleString();
      }
      console.log(`   - ${row.name}: ${formattedValue}`);
    });
    
    console.log('\n💡 Dashboard ID for reference:', dashboardId);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run seed
seed()
  .then(() => {
    console.log('\n✨ Done! Dashboard is ready to use.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
