// Data Sources endpoint - using PostgreSQL database
const { getPool } = require('./_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const pool = getPool();
      const { isActive = 'true' } = req.query;

      let query = `
        SELECT 
          id, name, type, connection_string as "connectionString",
          config, is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM data_sources 
        WHERE 1=1
      `;

      if (isActive === 'true') {
        query += ` AND is_active = true`;
      }

      query += ` ORDER BY name ASC`;

      const result = await pool.query(query);
      
      // Mask sensitive connection strings
      const sanitized = result.rows.map(ds => ({
        ...ds,
        connectionString: ds.connectionString ? '***MASKED***' : null
      }));

      console.log(`[Data Sources GET] Fetched ${sanitized.length} data sources from database`);
      res.status(200).json(sanitized);
    } catch (error) {
      console.error('[Data Sources GET] Database error:', error);
      res.status(200).json([]); // Return empty array on error
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getPool();
      const {
        name,
        type,
        connectionString,
        config
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'name and type are required' });
      }

      // Validate type
      const validTypes = ['postgres', 'mysql', 'mongodb', 'api', 'csv', 'excel'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: 'Invalid type. Must be one of: ' + validTypes.join(', ')
        });
      }

      const result = await pool.query(
        `INSERT INTO data_sources (
          name, type, connection_string, config
        ) VALUES ($1, $2, $3, $4)
        RETURNING 
          id, name, type, is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"`,
        [
          name,
          type,
          connectionString || null,
          config ? JSON.stringify(config) : null
        ]
      );

      console.log(`[Data Sources POST] Created data source ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[Data Sources POST] Database error:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'A data source with this name already exists'
        });
      }

      res.status(500).json({
        error: 'Failed to create data source',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};



