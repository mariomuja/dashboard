// Session Manager for Demo Isolation
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

class SessionManager {
  constructor() {
    this.useDatabase = !!process.env.DATABASE_URL;
    
    if (this.useDatabase) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      this.pool.on('error', (err) => {
        console.error('[SessionManager] Unexpected database error:', err);
      });
    }
    
    // In-memory sessions fallback
    this.sessions = new Map();
    this.SESSION_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Create a new demo session
   */
  async createSession() {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + this.SESSION_EXPIRATION_MS);

    if (this.useDatabase) {
      try {
        await this.pool.query(`
          INSERT INTO demo_sessions (session_id, expires_at)
          VALUES ($1, $2)
        `, [sessionId, expiresAt]);

        // Initialize session with demo data
        await this.pool.query(`
          SELECT initialize_demo_session($1)
        `, [sessionId]);

        console.log(`[SessionManager] Created session ${sessionId} (expires: ${expiresAt.toISOString()})`);
        return sessionId;
      } catch (error) {
        console.error('[SessionManager] Error creating session:', error);
        throw error;
      }
    } else {
      // In-memory fallback
      this.sessions.set(sessionId, { expiresAt, createdAt: new Date() });
      console.log(`[SessionManager] Created in-memory session ${sessionId}`);
      return sessionId;
    }
  }

  /**
   * Validate a session
   */
  async validateSession(sessionId) {
    if (!sessionId) return false;

    if (this.useDatabase) {
      try {
        const result = await this.pool.query(`
          SELECT session_id, expires_at, is_active
          FROM demo_sessions
          WHERE session_id = $1
        `, [sessionId]);

        if (result.rows.length === 0) return false;

        const session = result.rows[0];
        if (!session.is_active || new Date(session.expires_at) < new Date()) {
          await this.pool.query(`
            UPDATE demo_sessions SET is_active = FALSE WHERE session_id = $1
          `, [sessionId]);
          return false;
        }

        // Update last accessed
        await this.pool.query(`
          UPDATE demo_sessions SET last_accessed = CURRENT_TIMESTAMP WHERE session_id = $1
        `, [sessionId]);

        return true;
      } catch (error) {
        console.error('[SessionManager] Error validating session:', error);
        return false;
      }
    } else {
      // In-memory fallback
      const session = this.sessions.get(sessionId);
      if (!session || session.expiresAt < new Date()) {
        this.sessions.delete(sessionId);
        return false;
      }
      return true;
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    if (this.useDatabase) {
      try {
        const result = await this.pool.query(`
          SELECT cleanup_expired_sessions()
        `);
        console.log(`[SessionManager] Cleaned up expired sessions`);
        return result.rows[0].cleanup_expired_sessions;
      } catch (error) {
        console.error('[SessionManager] Error cleaning up sessions:', error);
        return 0;
      }
    } else {
      // In-memory cleanup
      const now = new Date();
      let count = 0;
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          this.sessions.delete(sessionId);
          count++;
        }
      }
      console.log(`[SessionManager] Cleaned up ${count} in-memory sessions`);
      return count;
    }
  }
}

module.exports = new SessionManager();
