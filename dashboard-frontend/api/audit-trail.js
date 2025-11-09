// Audit Trail endpoint - using PostgreSQL database
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
      const {
        userId,
        username,
        action,
        entityType,
        startDate,
        endDate,
        limit = '100',
        offset = '0'
      } = req.query;

      let query = `
        SELECT 
          id, user_id as "userId", username, action,
          entity_type as "entityType", entity_id as "entityId",
          description, changes, ip_address as "ipAddress",
          timestamp
        FROM audit_trail 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (userId) {
        query += ` AND user_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      }

      if (username) {
        query += ` AND username ILIKE $${paramCount}`;
        params.push(`%${username}%`);
        paramCount++;
      }

      if (action) {
        query += ` AND action = $${paramCount}`;
        params.push(action);
        paramCount++;
      }

      if (entityType) {
        query += ` AND entity_type = $${paramCount}`;
        params.push(entityType);
        paramCount++;
      }

      if (startDate) {
        query += ` AND timestamp >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND timestamp <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      query += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await pool.query(query, params);

      console.log(`[Audit Trail] Fetched ${result.rows.length} entries from database`);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('[Audit Trail] Database error:', error);
      
      // Return empty array on error
      res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getPool();
      const {
        userId,
        username,
        action,
        entityType,
        entityId,
        description,
        changes,
        ipAddress
      } = req.body;

      await pool.query(
        `INSERT INTO audit_trail (
          user_id, username, action, entity_type, entity_id,
          description, changes, ip_address, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          userId,
          username,
          action,
          entityType,
          entityId || null,
          description,
          changes ? JSON.stringify(changes) : null,
          ipAddress || null
        ]
      );

      console.log(`[Audit Trail] Created entry for ${username} - ${action}`);
      res.status(201).json({ success: true, message: 'Audit entry created' });
    } catch (error) {
      console.error('[Audit Trail POST] Database error:', error);
      res.status(500).json({
        error: 'Failed to create audit entry',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};

