// Check what data is actually in the database
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_T2PupfxKc7Zt@ep-silent-unit-add8qh6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  console.log('🔍 Checking database data...\n');
  
  const client = await pool.connect();
  
  try {
    // Check dashboards
    console.log('📊 Dashboards:');
    const dashboards = await client.query('SELECT id, name, owner_id FROM dashboards ORDER BY created_at DESC LIMIT 5');
    dashboards.rows.forEach(d => {
      console.log(`  - ${d.id} | ${d.name} | owner: ${d.owner_id || 'NULL'}`);
    });
    
    // Check KPIs
    console.log('\n📈 KPIs:');
    const kpis = await client.query('SELECT id, dashboard_id, name, unit FROM kpis ORDER BY created_at DESC');
    kpis.rows.forEach(k => {
      console.log(`  - ${k.id} | ${k.name} | dashboard: ${k.dashboard_id}`);
    });
    
    // Check KPI values count per KPI
    console.log('\n💰 KPI Values per KPI:');
    const valueCounts = await client.query(`
      SELECT k.name, COUNT(kv.id) as value_count
      FROM kpis k
      LEFT JOIN kpi_values kv ON kv.kpi_id = k.id
      GROUP BY k.id, k.name
      ORDER BY k.name
    `);
    valueCounts.rows.forEach(v => {
      console.log(`  - ${v.name}: ${v.value_count} values`);
    });
    
    // Check latest value for each KPI
    console.log('\n📊 Latest KPI Values:');
    const latestValues = await client.query(`
      SELECT k.name, k.unit, kv.value, kv.timestamp
      FROM kpis k
      LEFT JOIN LATERAL (
        SELECT value, timestamp
        FROM kpi_values
        WHERE kpi_id = k.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) kv ON true
      ORDER BY k.name
    `);
    latestValues.rows.forEach(v => {
      if (v.value) {
        const numValue = parseFloat(v.value);
        let formatted = numValue;
        if (v.unit === 'currency') formatted = `$${Math.round(numValue).toLocaleString()}`;
        else if (v.unit === 'percentage') formatted = `${numValue.toFixed(2)}%`;
        else if (v.unit === 'rating') formatted = `${numValue.toFixed(1)}/5`;
        else formatted = Math.round(numValue).toLocaleString();
        
        console.log(`  - ${v.name}: ${formatted} (at ${v.timestamp})`);
      } else {
        console.log(`  - ${v.name}: NO VALUE`);
      }
    });
    
    // Simulate what the API would return
    console.log('\n🔧 Simulating API response:');
    
    // Get the first/default dashboard
    const defaultDashboard = await client.query(`
      SELECT id FROM dashboards 
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (defaultDashboard.rows.length === 0) {
      console.log('  ❌ No dashboard found!');
    } else {
      const dashboardId = defaultDashboard.rows[0].id;
      console.log(`  Dashboard ID: ${dashboardId}`);
      
      const apiData = await client.query(`
        SELECT 
          k.id as kpi_id,
          k.name,
          k.unit,
          k.display_format,
          (SELECT value 
           FROM kpi_values 
           WHERE kpi_id = k.id 
           ORDER BY timestamp DESC 
           LIMIT 1) as current_value,
          (SELECT value 
           FROM kpi_values 
           WHERE kpi_id = k.id 
           ORDER BY timestamp DESC 
           OFFSET 1 LIMIT 1) as previous_value
        FROM kpis k
        WHERE k.dashboard_id = $1
        AND k.is_active = true
        ORDER BY k.created_at
      `, [dashboardId]);
      
      console.log('  API would return:');
      apiData.rows.forEach(row => {
        const current = row.current_value ? parseFloat(row.current_value) : null;
        const previous = row.previous_value ? parseFloat(row.previous_value) : null;
        const trend = (current && previous) ? (((current - previous) / previous) * 100).toFixed(1) : 0;
        
        console.log(`    ${row.name}:`);
        console.log(`      - current: ${current}`);
        console.log(`      - previous: ${previous}`);
        console.log(`      - trend: ${trend}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });


