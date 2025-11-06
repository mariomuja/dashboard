const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sessionManager = require('./session-manager');
const kpiIntegration = require('./kpi-integration');

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
app.get('/api/data/dashboard-data', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'src', 'assets', 'data', 'dashboard-data.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dashboard data file not found' });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
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

