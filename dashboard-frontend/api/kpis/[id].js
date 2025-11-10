// Single KPI endpoint - using PostgreSQL database
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT 
          id, dashboard_id as "dashboardId", name, description,
          data_source as "dataSource", query, formula,
          unit, display_format as "displayFormat",
          refresh_interval as "refreshInterval",
          is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM kpis 
        WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[KPI GET] Database error:', error);
      return res.status(500).json({
        error: 'Failed to get KPI',
        message: error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const pool = getPool();
      const {
        name,
        description,
        dataSource,
        query,
        formula,
        unit,
        displayFormat,
        refreshInterval,
        isActive
      } = req.body;

      const result = await pool.query(
        `UPDATE kpis 
        SET 
          name = COALESCE($2, name),
          description = $3,
          data_source = $4,
          query = $5,
          formula = $6,
          unit = $7,
          display_format = COALESCE($8, display_format),
          refresh_interval = COALESCE($9, refresh_interval),
          is_active = COALESCE($10, is_active),
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id, dashboard_id as "dashboardId", name, description,
          data_source as "dataSource", query, formula,
          unit, display_format as "displayFormat",
          refresh_interval as "refreshInterval",
          is_active as "isActive",
          created_at as "createdAt", updated_at as "updatedAt"`,
        [id, name, description, dataSource, query, formula, unit, displayFormat, refreshInterval, isActive]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      console.log(`[KPI PUT] Updated KPI ${id}`);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[KPI PUT] Database error:', error);
      return res.status(500).json({
        error: 'Failed to update KPI',
        message: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const pool = getPool();
      
      // Soft delete
      const result = await pool.query(
        'UPDATE kpis SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'KPI not found' });
      }

      console.log(`[KPI DELETE] Deleted KPI ${id}`);
      return res.status(200).json({ success: true, message: 'KPI deleted' });
    } catch (error) {
      console.error('[KPI DELETE] Database error:', error);
      return res.status(500).json({
        error: 'Failed to delete KPI',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};


