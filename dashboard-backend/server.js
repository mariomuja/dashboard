const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sessionManager = require('./session-manager');
const kpiIntegration = require('./kpi-integration');
const mockData = require('./mock-data');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting storage
const uploadAttempts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 5; // Max 5 uploads per minute

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!uploadAttempts.has(ip)) {
    uploadAttempts.set(ip, []);
  }
  
  const attempts = uploadAttempts.get(ip);
  
  // Remove old attempts outside the time window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return res.status(429).json({ 
      error: 'Too many upload attempts. Please wait a minute and try again.' 
    });
  }
  
  recentAttempts.push(now);
  uploadAttempts.set(ip, recentAttempts);
  
  next();
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('KPI Dashboard Backend - v2.0 - Session-based isolation enabled');
});

// File upload endpoint with rate limiting
app.post('/api/upload/dashboard-data', rateLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read and validate the uploaded JSON file
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    let jsonData;
    
    try {
      jsonData = JSON.parse(fileContent);
    } catch (e) {
      fs.unlinkSync(req.file.path); // Delete invalid file
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    // Validate structure
    const isValid = validateDashboardData(jsonData);
    if (!isValid) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid dashboard data structure. Must include kpi, revenue, sales, and conversion sections with week/month/year periods.' });
    }

    // Copy to assets directory
    const targetPath = path.join(__dirname, 'src', 'assets', 'data', 'dashboard-data.json');
    fs.copyFileSync(req.file.path, targetPath);
    
    // Clean up upload
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      message: 'Dashboard data updated successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Validation function for dashboard data
function validateDashboardData(data) {
  // Check if all required sections exist
  if (!data.kpi || !data.revenue || !data.sales || !data.conversion) {
    return false;
  }

  // Validate each section has week, month, year
  const sections = ['kpi', 'revenue', 'sales', 'conversion'];
  for (const section of sections) {
    if (!data[section].week || !data[section].month || !data[section].year) {
      return false;
    }
    
    if (!Array.isArray(data[section].week) || 
        !Array.isArray(data[section].month) || 
        !Array.isArray(data[section].year)) {
      return false;
    }
  }

  // Validate KPI structure
  const kpiValid = data.kpi.week.every(item => 
    item.id && item.title && item.value && 
    typeof item.change === 'number' && item.trend && item.icon && item.color
  );

  if (!kpiValid) {
    return false;
  }

  // Validate chart data structure
  const revenueValid = data.revenue.week.every(item => item.label && typeof item.value === 'number');
  const salesValid = data.sales.week.every(item => item.label && typeof item.value === 'number');
  const conversionValid = data.conversion.week.every(item => item.label && typeof item.value === 'number');

  return revenueValid && salesValid && conversionValid;
}

// Get current dashboard data endpoint
app.get('/api/data/dashboard-data', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    // For now, return mock data
    // TODO: Load session-specific data from database
    const dashboardData = {
      kpi: {
        week: mockData.dashboardData.kpis,
        month: mockData.dashboardData.kpis,
        year: mockData.dashboardData.kpis
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
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Failed to read dashboard data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dashboard data upload API is running',
    endpoints: {
      upload: 'POST /api/upload/dashboard-data',
      download: 'GET /api/data/dashboard-data'
    }
  });
});

// ============================================================================
// EXTERNAL KPI INTEGRATION (NEW - Cross-app KPI sharing)
// ============================================================================

// Receive KPI from external application (e.g., bookkeeping app)
app.post('/api/kpis/external', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const isValid = await sessionManager.validateSession(sessionId);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const result = await kpiIntegration.receiveExternalKPI(sessionId, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Receive batch of KPIs from external application
app.post('/api/kpis/external/batch', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const isValid = await sessionManager.validateSession(sessionId);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { sourceApp, sourceAppDisplay, kpis } = req.body;
    const results = await kpiIntegration.receiveKPIBatch(sessionId, sourceApp, sourceAppDisplay, kpis);
    res.status(201).json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all external KPIs for current session
app.get('/api/kpis/external', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const kpis = await kpiIntegration.getExternalKPIs(sessionId);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get external KPIs grouped by source application
app.get('/api/kpis/external/by-source', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(401).json({ error: 'Session ID required' });
    }

    const grouped = await kpiIntegration.getKPIsBySource(sessionId);
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Upload endpoint: POST http://localhost:' + PORT + '/api/upload/:dataType');
  console.log('External KPI endpoint: POST http://localhost:' + PORT + '/api/kpis/external');
});

module.exports = app;

