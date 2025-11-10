// Check database schema
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_T2PupfxKc7Zt@ep-silent-unit-add8qh6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  
  const client = await pool.connect();
  
  try {
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables in database:');
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(tables.join(', ') || 'No tables found');
    console.log('');
    
    // Get columns for each table
    for (const table of tables) {
      const columnsResult = await client.query(`
        SELECT 
          column_name, 
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      console.log(`\n📊 Table: ${table}`);
      console.log('Columns:');
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const def = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${def}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });


