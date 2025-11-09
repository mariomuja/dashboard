// KPIs endpoint - using PostgreSQL database
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
      const { dashboardId, isActive = 'true' } = req.query;

      let query = `
        SELECT 
          id, dashboard_id as "dashboardId", name, description,
          data_source as "dataSource", query, formula,
          unit, display_format as "displayFormat",
          refresh_interval as "refreshInterval",
          is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM kpis 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (dashboardId) {
        query += ` AND dashboard_id = $${paramCount}`;
        params.push(dashboardId);
        paramCount++;
      }

      if (isActive === 'true') {
        query += ` AND is_active = true`;
      }

      query += ` ORDER BY created_at ASC`;

      const result = await pool.query(query, params);
      
      console.log(`[KPIs GET] Fetched ${result.rows.length} KPIs from database`);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('[KPIs GET] Database error:', error);
      res.status(200).json([]); // Return empty array on error
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getPool();
      const {
        dashboardId,
        name,
        description,
        dataSource,
        query,
        formula,
        unit,
        displayFormat,
        refreshInterval
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const result = await pool.query(
        `INSERT INTO kpis (
          dashboard_id, name, description, data_source, query, formula,
          unit, display_format, refresh_interval
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING 
          id, dashboard_id as "dashboardId", name, description,
          data_source as "dataSource", query, formula,
          unit, display_format as "displayFormat",
          refresh_interval as "refreshInterval",
          is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"`,
        [
          dashboardId || null,
          name,
          description || null,
          dataSource || null,
          query || null,
          formula || null,
          unit || null,
          displayFormat || 'number',
          refreshInterval || 300
        ]
      );

      console.log(`[KPIs POST] Created KPI ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[KPIs POST] Database error:', error);
      res.status(500).json({
        error: 'Failed to create KPI',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};

