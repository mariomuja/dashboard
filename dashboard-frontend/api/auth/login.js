// Login endpoint for Vercel Serverless
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Demo credentials validation
    const DEMO_USERNAME = 'demo';
    const DEMO_PASSWORD = 'DemoKPI2025!Secure';

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      // Create a simple session ID (for now, without database)
      const sessionId = 'vercel-session-' + uuidv4();

      res.status(200).json({
        success: true,
        sessionId,
        user: {
          id: 'demo-user',
          username: DEMO_USERNAME,
          name: 'Demo User',
          email: 'demo@kpi-dashboard.com',
          role: 'demo'
        },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};




