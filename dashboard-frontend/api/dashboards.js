// Dashboards endpoint - using PostgreSQL database
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
      const { ownerId, isPublic, isActive = 'true' } = req.query;

      let query = `
        SELECT 
          id, name, description, owner_id as "ownerId",
          layout, is_public as "isPublic", is_active as "isActive",
          version, created_at as "createdAt", updated_at as "updatedAt"
        FROM dashboards 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (ownerId) {
        query += ` AND owner_id = $${paramCount}`;
        params.push(ownerId);
        paramCount++;
      }

      if (isPublic === 'true') {
        query += ` AND is_public = true`;
      }

      if (isActive === 'true') {
        query += ` AND is_active = true`;
      }

      query += ` ORDER BY created_at DESC`;

      const result = await pool.query(query, params);
      
      console.log(`[Dashboards GET] Fetched ${result.rows.length} dashboards from database`);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('[Dashboards GET] Database error:', error);
      res.status(200).json([]); // Return empty array on error
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getPool();
      const {
        name,
        description,
        ownerId,
        layout,
        isPublic
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const result = await pool.query(
        `INSERT INTO dashboards (
          name, description, owner_id, layout, is_public
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id, name, description, owner_id as "ownerId",
          layout, is_public as "isPublic", is_active as "isActive",
          version, created_at as "createdAt", updated_at as "updatedAt"`,
        [
          name,
          description || null,
          ownerId || null,
          layout ? JSON.stringify(layout) : '[]',
          isPublic || false
        ]
      );

      console.log(`[Dashboards POST] Created dashboard ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[Dashboards POST] Database error:', error);
      res.status(500).json({
        error: 'Failed to create dashboard',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};

