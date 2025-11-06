const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

class SessionManager {
  constructor() {
    this.useDatabase = !!process.env.DATABASE_URL;
    
    if (this.useDatabase) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } else {
      this.sessions = new Map();
    }
    
    this.SESSION_EXPIRY_HOURS = 24;
  }

  async createDemoSession() {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + (this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000));

    if (this.useDatabase) {
      await this.pool.query(
        'INSERT INTO demo_sessions (session_id, expires_at) VALUES ($1, $2)',
        [sessionId, expiresAt]
      );
      await this.pool.query('SELECT initialize_demo_session($1)', [sessionId]);
    } else {
      this.sessions.set(sessionId, {
        expiresAt,
        data: this.getDefaultData()
      });
    }

    return { sessionId, expiresAt };
  }

  async validateSession(sessionId) {
    if (!sessionId) return false;

    if (this.useDatabase) {
      const result = await this.pool.query(
        'UPDATE demo_sessions SET last_accessed = CURRENT_TIMESTAMP WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP RETURNING session_id',
        [sessionId]
      );
      return result.rows.length > 0;
    } else {
      const session = this.sessions.get(sessionId);
      return session && session.expiresAt > new Date();
    }
  }

  getDefaultData() {
    return {
      kpi: { week: { currentWeek: [12500, 13200, 14100, 13800, 15200, 16100, 14500], lastWeek: [11800, 12400, 13100, 12900, 14300, 15200, 13700] } },
      revenue: { week: { currentWeek: [45000, 48000, 52000, 54000, 58000, 62000, 56000], lastWeek: [42000, 45000, 49000, 51000, 55000, 59000, 53000] } },
      sales: { week: { currentWeek: [850, 920, 1050, 980, 1120, 1200, 1080], lastWeek: [780, 850, 980, 910, 1050, 1130, 1010] } },
      conversion: { week: { currentWeek: [2.8, 3.1, 3.4, 3.2, 3.6, 3.9, 3.5], lastWeek: [2.5, 2.8, 3.1, 2.9, 3.3, 3.6, 3.2] } }
    };
  }
}

module.exports = new SessionManager();

