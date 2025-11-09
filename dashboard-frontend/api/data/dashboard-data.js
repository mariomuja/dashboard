// Dashboard data endpoint - using PostgreSQL database for KPI values
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();

    // Try to fetch KPI data from database
    try {
      const kpiResult = await pool.query(`
        SELECT 
          k.id, k.name, k.unit, k.display_format as "displayFormat",
          kv.value, kv.timestamp
        FROM kpis k
        LEFT JOIN kpi_values kv ON k.id = kv.kpi_id
        WHERE k.is_active = true
        ORDER BY k.created_at, kv.timestamp DESC
        LIMIT 20
      `);

      if (kpiResult.rows.length > 0) {
        // Transform database data to dashboard format
        const kpiData = {
          week: [],
          month: [],
          year: []
        };

        kpiResult.rows.slice(0, 4).forEach((row, idx) => {
          const kpi = {
            id: row.id,
            title: row.name,
            value: formatValue(parseFloat(row.value), row.unit, row.displayFormat),
            change: Math.random() * 20 - 5, // TODO: Calculate actual change
            trend: Math.random() > 0.5 ? 'up' : 'down',
            icon: 'chart',
            color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][idx % 4]
          };
          kpiData.week.push(kpi);
          kpiData.month.push(kpi);
          kpiData.year.push(kpi);
        });

        console.log(`[Dashboard Data] Fetched ${kpiResult.rows.length} KPIs from database`);

        return res.status(200).json({
          kpi: kpiData,
          revenue: generateTimeSeriesData(),
          sales: generateTimeSeriesData(),
          conversion: generateConversionData()
        });
      }
    } catch (dbError) {
      console.warn('[Dashboard Data] Database query failed, using fallback data:', dbError.message);
    }

    // Fallback to demo data if database is empty or unavailable
    const dashboardData = {
      kpi: {
        week: [
          { id: '1', title: 'Total Revenue', value: '$125,430', change: 12.5, trend: 'up', icon: 'dollar', color: '#10b981' },
          { id: '2', title: 'Active Users', value: '8,432', change: 8.2, trend: 'up', icon: 'users', color: '#3b82f6' },
          { id: '3', title: 'Conversion Rate', value: '3.24%', change: -2.1, trend: 'down', icon: 'percent', color: '#f59e0b' },
          { id: '4', title: 'Satisfaction', value: '4.8/5.0', change: 0.3, trend: 'up', icon: 'star', color: '#8b5cf6' }
        ],
        month: [
          { id: '1', title: 'Total Revenue', value: '$125,430', change: 12.5, trend: 'up', icon: 'dollar', color: '#10b981' },
          { id: '2', title: 'Active Users', value: '8,432', change: 8.2, trend: 'up', icon: 'users', color: '#3b82f6' },
          { id: '3', title: 'Conversion Rate', value: '3.24%', change: -2.1, trend: 'down', icon: 'percent', color: '#f59e0b' },
          { id: '4', title: 'Satisfaction', value: '4.8/5.0', change: 0.3, trend: 'up', icon: 'star', color: '#8b5cf6' }
        ],
        year: [
          { id: '1', title: 'Total Revenue', value: '$125,430', change: 12.5, trend: 'up', icon: 'dollar', color: '#10b981' },
          { id: '2', title: 'Active Users', value: '8,432', change: 8.2, trend: 'up', icon: 'users', color: '#3b82f6' },
          { id: '3', title: 'Conversion Rate', value: '3.24%', change: -2.1, trend: 'down', icon: 'percent', color: '#f59e0b' },
          { id: '4', title: 'Satisfaction', value: '4.8/5.0', change: 0.3, trend: 'up', icon: 'star', color: '#8b5cf6' }
        ]
      },
      revenue: generateTimeSeriesData(),
      sales: generateTimeSeriesData(),
      conversion: generateConversionData()
    };

    console.log('[Dashboard Data] Using fallback demo data');
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('[Dashboard Data] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
};

function formatValue(value, unit, format) {
  if (format === 'currency') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else if (format === 'percentage') {
    return `${value.toFixed(2)}%`;
  } else if (unit) {
    return `${value} ${unit}`;
  }
  return value.toString();
}

function generateTimeSeriesData() {
  return {
    week: [
      { label: 'Mon', value: Math.floor(Math.random() * 5000) + 5000 },
      { label: 'Tue', value: Math.floor(Math.random() * 5000) + 5000 },
      { label: 'Wed', value: Math.floor(Math.random() * 5000) + 5000 },
      { label: 'Thu', value: Math.floor(Math.random() * 5000) + 5000 },
      { label: 'Fri', value: Math.floor(Math.random() * 5000) + 5000 },
      { label: 'Sat', value: Math.floor(Math.random() * 5000) + 5000 },
      { label: 'Sun', value: Math.floor(Math.random() * 5000) + 5000 }
    ],
    month: Array.from({ length: 4 }, (_, i) => ({
      label: `Week ${i + 1}`,
      value: Math.floor(Math.random() * 20000) + 40000
    })),
    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      label: month,
      value: Math.floor(Math.random() * 30000) + 45000
    }))
  };
}

function generateConversionData() {
  return {
    week: [
      { label: 'Mon', value: (Math.random() * 2 + 2).toFixed(1) },
      { label: 'Tue', value: (Math.random() * 2 + 2).toFixed(1) },
      { label: 'Wed', value: (Math.random() * 2 + 2).toFixed(1) },
      { label: 'Thu', value: (Math.random() * 2 + 2).toFixed(1) },
      { label: 'Fri', value: (Math.random() * 2 + 2).toFixed(1) },
      { label: 'Sat', value: (Math.random() * 2 + 2).toFixed(1) },
      { label: 'Sun', value: (Math.random() * 2 + 2).toFixed(1) }
    ],
    month: Array.from({ length: 4 }, (_, i) => ({
      label: `Week ${i + 1}`,
      value: (Math.random() * 2 + 2).toFixed(1)
    })),
    year: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
      label: month,
      value: (Math.random() * 2 + 2).toFixed(1)
    }))
  };
}
