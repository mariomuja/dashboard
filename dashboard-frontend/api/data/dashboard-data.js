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
      // Get latest KPI values (most recent value for each KPI)
      const kpiResult = await pool.query(`
        WITH latest_values AS (
          SELECT DISTINCT ON (kpi_id) 
            kpi_id, value, timestamp
          FROM kpi_values
          ORDER BY kpi_id, timestamp DESC
        ),
        previous_values AS (
          SELECT DISTINCT ON (kpi_id)
            kpi_id, value as prev_value, timestamp as prev_timestamp
          FROM kpi_values
          WHERE timestamp < NOW() - INTERVAL '7 days'
          ORDER BY kpi_id, timestamp DESC
        )
        SELECT 
          k.id, k.name, k.unit, 
          k.display_format as "displayFormat",
          lv.value as "currentValue",
          pv.prev_value as "previousValue",
          lv.timestamp as "lastUpdate"
        FROM kpis k
        LEFT JOIN latest_values lv ON k.id = lv.kpi_id
        LEFT JOIN previous_values pv ON k.id = pv.kpi_id
        WHERE k.is_active = true
        ORDER BY k.created_at
        LIMIT 4
      `);

      if (kpiResult.rows.length > 0) {
        console.log(`[Dashboard Data] Found ${kpiResult.rows.length} KPIs with values from database`);
        
        // Transform database data to dashboard format
        const kpiData = {
          week: [],
          month: [],
          year: []
        };

        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
        const icons = ['dollar', 'users', 'percent', 'star'];

        kpiResult.rows.forEach((row, idx) => {
          const currentValue = parseFloat(row.currentValue) || 0;
          const previousValue = parseFloat(row.previousValue) || currentValue;
          const change = previousValue !== 0 
            ? ((currentValue - previousValue) / previousValue * 100).toFixed(1)
            : 0;
          
          const kpi = {
            id: row.id,
            title: row.name,
            value: formatValue(currentValue, row.unit, row.displayFormat),
            change: parseFloat(change),
            trend: change >= 0 ? 'up' : 'down',
            icon: icons[idx % icons.length],
            color: colors[idx % colors.length]
          };
          
          kpiData.week.push(kpi);
          kpiData.month.push(kpi);
          kpiData.year.push(kpi);
        });

        // Get time-series data for charts
        const timeSeriesResult = await pool.query(`
          SELECT 
            k.name as kpi_name,
            DATE_TRUNC('day', kv.timestamp) as day,
            AVG(kv.value) as avg_value
          FROM kpis k
          JOIN kpi_values kv ON k.id = kv.kpi_id
          WHERE k.is_active = true
            AND kv.timestamp >= NOW() - INTERVAL '30 days'
          GROUP BY k.name, DATE_TRUNC('day', kv.timestamp)
          ORDER BY day ASC
        `);

        console.log(`[Dashboard Data] Fetched ${timeSeriesResult.rows.length} time-series data points`);

        return res.status(200).json({
          kpi: kpiData,
          revenue: generateTimeSeriesDataFromDB(timeSeriesResult.rows, 'Total Revenue'),
          sales: generateTimeSeriesData(),
          conversion: generateConversionData()
        });
      } else {
        console.warn('[Dashboard Data] No KPI data found in database, using fallback');
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
          { id: '4', title: 'Customer Satisfaction', value: '4.8/5', change: 0.3, trend: 'up', icon: 'star', color: '#8b5cf6' }
        ],
        month: [
          { id: '1', title: 'Total Revenue', value: '$125,430', change: 12.5, trend: 'up', icon: 'dollar', color: '#10b981' },
          { id: '2', title: 'Active Users', value: '8,432', change: 8.2, trend: 'up', icon: 'users', color: '#3b82f6' },
          { id: '3', title: 'Conversion Rate', value: '3.24%', change: -2.1, trend: 'down', icon: 'percent', color: '#f59e0b' },
          { id: '4', title: 'Customer Satisfaction', value: '4.8/5', change: 0.3, trend: 'up', icon: 'star', color: '#8b5cf6' }
        ],
        year: [
          { id: '1', title: 'Total Revenue', value: '$125,430', change: 12.5, trend: 'up', icon: 'dollar', color: '#10b981' },
          { id: '2', title: 'Active Users', value: '8,432', change: 8.2, trend: 'up', icon: 'users', color: '#3b82f6' },
          { id: '3', title: 'Conversion Rate', value: '3.24%', change: -2.1, trend: 'down', icon: 'percent', color: '#f59e0b' },
          { id: '4', title: 'Customer Satisfaction', value: '4.8/5', change: 0.3, trend: 'up', icon: 'star', color: '#8b5cf6' }
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
  if (!value || isNaN(value)) {
    return '0';
  }
  
  if (format === 'currency') {
    return `$${Math.round(value).toLocaleString('en-US')}`;
  } else if (format === 'percentage') {
    return `${value.toFixed(2)}%`;
  } else if (format === 'rating') {
    return `${value.toFixed(1)}/5`;
  } else if (format === 'number') {
    return Math.round(value).toLocaleString('en-US');
  } else if (unit) {
    return `${Math.round(value).toLocaleString('en-US')} ${unit}`;
  }
  return Math.round(value).toLocaleString('en-US');
}

function generateTimeSeriesDataFromDB(dbRows, kpiName) {
  const filtered = dbRows.filter(row => row.kpi_name === kpiName);
  
  if (filtered.length === 0) {
    return generateTimeSeriesData();
  }

  // Group by week for month view, by day for week view
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    week: filtered.slice(-7).map((row, idx) => ({
      label: dayLabels[idx % 7],
      value: Math.round(parseFloat(row.avg_value))
    })),
    month: filtered.slice(-4).map((row, idx) => ({
      label: `Week ${idx + 1}`,
      value: Math.round(parseFloat(row.avg_value))
    })),
    year: filtered.slice(-12).map((row, idx) => ({
      label: monthLabels[idx % 12],
      value: Math.round(parseFloat(row.avg_value))
    }))
  };
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
