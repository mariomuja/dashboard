// Automated Database Seeding Script
// Usage: node seed-database.js

const { Pool } = require('pg');

// Get DATABASE_URL from environment or use the one from .env file
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found!');
  console.error('');
  console.error('Please set DATABASE_URL environment variable:');
  console.error('');
  console.error('Windows PowerShell:');
  console.error('  $env:DATABASE_URL="postgresql://..."');
  console.error('  node seed-database.js');
  console.error('');
  console.error('Windows CMD:');
  console.error('  set DATABASE_URL=postgresql://...');
  console.error('  node seed-database.js');
  console.error('');
  console.error('Or create a .env file with:');
  console.error('  DATABASE_URL=postgresql://...');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database seeding...\n');

    // Step 1: Insert Demo User
    console.log('1️⃣  Inserting demo user...');
    await client.query(`
      INSERT INTO users (id, username, email, display_name, roles, is_active) 
      VALUES ('11111111-1111-1111-1111-111111111111', 'demo', 'demo@kpi-dashboard.com', 'Demo User', ARRAY['user', 'admin'], true)
      ON CONFLICT (username) DO NOTHING
    `);
    console.log('   ✅ User created\n');

    // Step 2: Insert Dashboard
    console.log('2️⃣  Inserting dashboard...');
    await client.query(`
      INSERT INTO dashboards (id, name, description, owner_id, layout, is_public, is_active)
      VALUES ('22222222-2222-2222-2222-222222222222', 'Executive Dashboard', 'High-level KPIs and metrics', '11111111-1111-1111-1111-111111111111', '[]'::JSONB, true, true)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('   ✅ Dashboard created\n');

    // Step 3: Insert 4 KPIs
    console.log('3️⃣  Inserting KPIs...');
    await client.query(`
      INSERT INTO kpis (id, dashboard_id, name, description, unit, display_format, is_active)
      VALUES 
      ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Total Revenue', 'Year-to-date total revenue', 'USD', 'currency', true),
      ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Active Users', 'Number of active users', 'users', 'number', true),
      ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Conversion Rate', 'Conversion percentage', '%', 'percentage', true),
      ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Customer Satisfaction', 'Average satisfaction score', '/5', 'rating', true)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('   ✅ 4 KPIs created\n');

    // Step 4: Insert KPI Values
    console.log('4️⃣  Inserting KPI values...');
    await client.query(`
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
    console.log('   ✅ 8 KPI values inserted\n');

    // Step 5: Verify
    console.log('5️⃣  Verifying data...');
    const result = await client.query(`
      SELECT k.name, COUNT(*) as value_count
      FROM kpis k
      JOIN kpi_values kv ON k.id = kv.kpi_id
      GROUP BY k.name
      ORDER BY k.name
    `);

    console.log('\n📊 Database Summary:');
    console.log('═══════════════════════════════════════');
    result.rows.forEach(row => {
      console.log(`   ${row.name.padEnd(25)} ${row.value_count} values`);
    });
    console.log('═══════════════════════════════════════\n');

    // Get latest values
    const latestValues = await client.query(`
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

    console.log('📈 Latest KPI Values:');
    console.log('═══════════════════════════════════════');
    latestValues.rows.forEach(row => {
      let formattedValue = row.value;
      if (row.display_format === 'currency') {
        formattedValue = `$${parseFloat(row.value).toLocaleString('en-US')}`;
      } else if (row.display_format === 'percentage') {
        formattedValue = `${row.value}%`;
      } else if (row.display_format === 'rating') {
        formattedValue = `${row.value}/5`;
      }
      console.log(`   ${row.name.padEnd(25)} ${formattedValue}`);
    });
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('🚀 Your dashboard should now display:');
    console.log('   • Total Revenue: $125,430');
    console.log('   • Active Users: 8,432');
    console.log('   • Conversion Rate: 3.24%');
    console.log('   • Customer Satisfaction: 4.8/5\n');
    console.log('🌐 Visit: https://kpi-dashboard-eight.vercel.app');
    console.log('💡 Tip: Hard refresh (Ctrl+F5) to see changes\n');

  } catch (error) {
    console.error('\n❌ ERROR during seeding:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. DATABASE_URL is correct');
    console.error('2. Tables exist (run schema.sql first if needed)');
    console.error('3. Network connection to Neon is working');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});


