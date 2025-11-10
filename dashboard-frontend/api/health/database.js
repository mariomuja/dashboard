// Database health check endpoint
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      return res.status(500).json({
        status: 'unhealthy',
        error: 'DATABASE_URL not configured',
        message: 'Please set DATABASE_URL in Vercel Environment Variables',
        instructions: 'https://vercel.com → Project → Settings → Environment Variables'
      });
    }

    const pool = getPool();
    
    // Test connection
    const client = await pool.connect();
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    
    // Count KPIs and values
    let kpiCount = 0;
    let valueCount = 0;
    
    if (tables.includes('kpis')) {
      const kpiResult = await client.query('SELECT COUNT(*) FROM kpis');
      kpiCount = parseInt(kpiResult.rows[0].count);
    }
    
    if (tables.includes('kpi_values')) {
      const valueResult = await client.query('SELECT COUNT(*) FROM kpi_values');
      valueCount = parseInt(valueResult.rows[0].count);
    }
    
    client.release();

    const needsSeeding = kpiCount === 0 || valueCount === 0;

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      tables: tables,
      kpis: kpiCount,
      kpiValues: valueCount,
      needsSeeding: needsSeeding,
      message: needsSeeding 
        ? 'Database is empty. Run seed script or call /api/seed/run (POST)'
        : 'Database is ready',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Health Check] Database error:', error);
    
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      code: error.code,
      hint: error.code === 'ENOTFOUND' 
        ? 'DATABASE_URL hostname is incorrect'
        : error.code === 'ECONNREFUSED'
        ? 'Database is not accessible (check Neon status)'
        : 'Check Vercel logs for details',
      timestamp: new Date().toISOString()
    });
  }
};
