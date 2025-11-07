// External KPIs endpoint for Vercel Serverless
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // For now, return empty array (can be extended later with Neon database)
  res.status(200).json([]);
};


