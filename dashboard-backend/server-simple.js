const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('KPI Dashboard Backend - SIMPLE VERSION - Working!');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    version: '1.0-simple',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'demo' && password === 'DemoKPI2025!Secure') {
    const sessionId = 'demo-session-' + Date.now();
    res.json({
      success: true,
      sessionId,
      user: {
        id: 'demo-user',
        username: 'demo',
        name: 'Demo User',
        email: 'demo@kpi-dashboard.com',
        role: 'demo'
      }
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Dashboard data endpoint
app.get('/api/data/dashboard-data', (req, res) => {
  const mockData = {
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
    revenue: {
      week: [
        { label: 'Mon', value: 8500 },
        { label: 'Tue', value: 9200 },
        { label: 'Wed', value: 8800 },
        { label: 'Thu', value: 9500 },
        { label: 'Fri', value: 10200 },
        { label: 'Sat', value: 7800 },
        { label: 'Sun', value: 6900 }
      ],
      month: [
        { label: 'Week 1', value: 45000 },
        { label: 'Week 2', value: 48000 },
        { label: 'Week 3', value: 52000 },
        { label: 'Week 4', value: 62000 }
      ],
      year: [
        { label: 'Jan', value: 45000 },
        { label: 'Feb', value: 48000 },
        { label: 'Mar', value: 52000 },
        { label: 'Apr', value: 54000 },
        { label: 'May', value: 58000 },
        { label: 'Jun', value: 62000 },
        { label: 'Jul', value: 65000 },
        { label: 'Aug', value: 68000 },
        { label: 'Sep', value: 70000 },
        { label: 'Oct', value: 72000 },
        { label: 'Nov', value: 75000 },
        { label: 'Dec', value: 78000 }
      ]
    },
    sales: {
      week: [
        { label: 'Mon', value: 120 },
        { label: 'Tue', value: 150 },
        { label: 'Wed', value: 135 },
        { label: 'Thu', value: 160 },
        { label: 'Fri', value: 180 },
        { label: 'Sat', value: 95 },
        { label: 'Sun', value: 85 }
      ],
      month: [
        { label: 'Week 1', value: 320 },
        { label: 'Week 2', value: 450 },
        { label: 'Week 3', value: 380 },
        { label: 'Week 4', value: 610 }
      ],
      year: [
        { label: 'Jan', value: 320 },
        { label: 'Feb', value: 450 },
        { label: 'Mar', value: 380 },
        { label: 'Apr', value: 520 },
        { label: 'May', value: 490 },
        { label: 'Jun', value: 610 },
        { label: 'Jul', value: 680 },
        { label: 'Aug', value: 720 },
        { label: 'Sep', value: 650 },
        { label: 'Oct', value: 780 },
        { label: 'Nov', value: 820 },
        { label: 'Dec', value: 950 }
      ]
    },
    conversion: {
      week: [
        { label: 'Mon', value: 3.2 },
        { label: 'Tue', value: 3.5 },
        { label: 'Wed', value: 3.1 },
        { label: 'Thu', value: 3.8 },
        { label: 'Fri', value: 4.1 },
        { label: 'Sat', value: 2.9 },
        { label: 'Sun', value: 2.7 }
      ],
      month: [
        { label: 'Week 1', value: 2.8 },
        { label: 'Week 2', value: 3.2 },
        { label: 'Week 3', value: 3.5 },
        { label: 'Week 4', value: 3.9 }
      ],
      year: [
        { label: 'Jan', value: 2.5 },
        { label: 'Feb', value: 2.8 },
        { label: 'Mar', value: 3.1 },
        { label: 'Apr', value: 3.0 },
        { label: 'May', value: 3.3 },
        { label: 'Jun', value: 3.5 },
        { label: 'Jul', value: 3.7 },
        { label: 'Aug', value: 3.8 },
        { label: 'Sep', value: 3.6 },
        { label: 'Oct', value: 3.9 },
        { label: 'Nov', value: 4.1 },
        { label: 'Dec', value: 4.3 }
      ]
    }
  };
  
  res.json(mockData);
});

// External KPIs endpoint
app.get('/api/kpis/external', (req, res) => {
  res.json([]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  / - Root');
  console.log('  GET  /api/health - Health check');
  console.log('  POST /api/auth/login - Login');
  console.log('  GET  /api/data/dashboard-data - Dashboard data');
  console.log('  GET  /api/kpis/external - External KPIs');
});

module.exports = app;

