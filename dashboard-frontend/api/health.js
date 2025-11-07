// Health check endpoint for Vercel Serverless
module.exports = (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'KPI Dashboard Backend API - Vercel Serverless',
    version: '2.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      data: 'GET /api/data/dashboard-data',
      externalKpis: 'GET /api/kpis/external'
    }
  });
};

