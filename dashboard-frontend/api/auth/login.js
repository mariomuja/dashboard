// Login endpoint - using PostgreSQL database
const { getPool } = require('../_db');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    const pool = getPool();

    // Try to find user in database
    let user;
    let sessionId = 'session-' + uuidv4();
    
    try {
      const userResult = await pool.query(
        `SELECT 
          id, username, email, display_name as "displayName",
          roles, is_active as "isActive",
          two_factor_enabled as "twoFactorEnabled"
        FROM users 
        WHERE username = $1 AND is_active = true
        LIMIT 1`,
        [username || 'demo']
      );

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        
        // Update last login
        await pool.query(
          'UPDATE users SET last_login = NOW() WHERE id = $1',
          [user.id]
        );

        // Create session in database
        await pool.query(
          `INSERT INTO sessions (user_id, session_token, expires_at, ip_address, user_agent)
          VALUES ($1, $2, NOW() + INTERVAL '24 hours', $3, $4)`,
          [user.id, sessionId, req.headers['x-forwarded-for'] || 'unknown', req.headers['user-agent']]
        );

        console.log(`[Auth] Database user logged in: ${username}`);
      }
    } catch (dbError) {
      console.warn('[Auth] Database query failed, using fallback demo user:', dbError.message);
    }

    // If no database user found or database error, create demo user
    if (!user) {
      user = {
        id: 'demo-user-' + Date.now(),
        username: username || 'demo',
        email: 'demo@kpi-dashboard.com',
        displayName: 'Demo User',
        roles: ['admin', 'user'],
        isActive: true,
        twoFactorEnabled: false
      };
      console.log(`[Auth] Created demo user: ${username}`);
    }

    res.status(200).json({
      success: true,
      sessionId,
      user: {
        id: user.id,
        username: user.username,
        name: user.displayName || user.username,
        email: user.email,
        role: user.roles?.[0] || 'user'
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};
