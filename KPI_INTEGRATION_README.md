# Cross-App KPI Integration

## Overview

The KPI Dashboard now supports receiving real-time KPIs from external applications, enabling a centralized view of metrics across your entire business ecosystem.

## Features

### 📡 External KPI Ingestion

- **Real-time KPI Sharing**: External apps can push KPIs to the dashboard in real-time
- **Source Tracking**: Each KPI is labeled with its source application
- **Multi-format Support**: Supports simple value KPIs and chart-based KPIs
- **Session Isolation**: KPIs are scoped to user sessions for demo/multi-tenant scenarios

### 🔗 Integrated Applications

#### International Bookkeeping App
Automatically sends the following financial KPIs:

- **Total Assets** - Current asset value with trend
- **Net Income** - Revenue minus expenses  
- **Total Revenue** - Year-to-date revenue
- **Total Expenses** - Year-to-date expenses
- **Cash Balance** - Current cash account balance
- **Journal Entries** - Count of recorded entries
- **Active Accounts** - Number of active accounts
- **Revenue Trend Chart** - Monthly revenue visualization

## How It Works

### Architecture

```
┌──────────────────┐         ┌──────────────────┐
│  Bookkeeping App │────────▶│  KPI Dashboard   │
│                  │  HTTP   │                  │
│  • Calculates    │  POST   │  • Receives KPIs │
│    metrics       │         │  • Stores data   │
│  • Sends KPIs    │         │  • Displays UI   │
└──────────────────┘         └──────────────────┘
```

### Data Flow

1. **User logs in** to bookkeeping app → Session ID generated
2. **Dashboard metrics calculated** → KPI data prepared
3. **KPIs sent to dashboard** via REST API with session ID
4. **Dashboard stores KPIs** in PostgreSQL with source app label
5. **User opens dashboard** → Sees KPIs grouped by source application

### API Endpoints

#### Send Single KPI
```http
POST /api/kpis/external
X-Session-Id: <session-id>
Content-Type: application/json

{
  "sourceApp": "bookkeeping",
  "sourceAppDisplay": "International Bookkeeping",
  "kpiName": "Total Revenue",
  "kpiValue": 55000.00,
  "kpiUnit": "$",
  "kpiChange": 18.2,
  "kpiIcon": "💵",
  "kpiColor": "green",
  "description": "Year-to-date revenue",
  "category": "financial",
  "displayOrder": 1
}
```

#### Send Batch of KPIs
```http
POST /api/kpis/external/batch
X-Session-Id: <session-id>
Content-Type: application/json

{
  "sourceApp": "bookkeeping",
  "sourceAppDisplay": "International Bookkeeping",
  "kpis": [
    {
      "kpiName": "Total Assets",
      "kpiValue": 32000.00,
      "kpiUnit": "$",
      "kpiChange": 12.5,
      "kpiIcon": "💰",
      "kpiColor": "blue",
      "description": "Total assets from bookkeeping",
      "category": "financial",
      "displayOrder": 1
    },
    // ... more KPIs
  ]
}
```

#### Get External KPIs
```http
GET /api/kpis/external
X-Session-Id: <session-id>

# Response: Array of KPI objects
```

#### Get KPIs Grouped by Source
```http
GET /api/kpis/external/by-source
X-Session-Id: <session-id>

# Response: KPIs grouped by source application
```

## Database Schema

### `external_kpis` Table

```sql
CREATE TABLE external_kpis (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES demo_sessions(session_id),
    source_app VARCHAR(100) NOT NULL,
    source_app_display VARCHAR(255) NOT NULL,
    kpi_name VARCHAR(255) NOT NULL,
    kpi_value DECIMAL(15,2),
    kpi_unit VARCHAR(50),
    kpi_change DECIMAL(5,2),
    kpi_icon VARCHAR(50),
    kpi_color VARCHAR(20),
    chart_type VARCHAR(50),
    chart_data JSONB,
    description TEXT,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Integration Guide

### For App Developers

To integrate your application with the KPI Dashboard:

1. **Install axios** (or your preferred HTTP client)
   ```bash
   npm install axios
   ```

2. **Create a KPI sender module**
   ```javascript
   const axios = require('axios');
   
   async function sendKPI(sessionId, kpiData) {
     await axios.post('http://localhost:3001/api/kpis/external', kpiData, {
       headers: {
         'Content-Type': 'application/json',
         'X-Session-Id': sessionId
       }
     });
   }
   ```

3. **Send KPIs after key operations**
   ```javascript
   // After calculating metrics
   const metrics = calculateMetrics();
   await sendKPI(sessionId, {
     sourceApp: 'my-app',
     sourceAppDisplay: 'My Application',
     kpiName: 'Monthly Sales',
     kpiValue: metrics.sales,
     kpiUnit: '$',
     kpiChange: metrics.growthRate,
     kpiIcon: '💰',
     kpiColor: 'green'
   });
   ```

## UI Components

### External KPIs Display

The dashboard automatically displays external KPIs in a dedicated section:

- **Source-grouped layout**: KPIs are grouped by source application
- **Visual indicators**: Each KPI shows its icon, value, change percentage, and source
- **Color-coded changes**: Green for positive, red for negative, gray for neutral
- **Chart support**: Chart-based KPIs are displayed with visualization placeholders
- **Responsive design**: Works on desktop and mobile devices

### Styling

KPI cards automatically adapt to your theme:
- Light/dark mode support
- Hover effects for better UX
- Mobile-responsive grid layout

## Configuration

### Environment Variables

#### Dashboard Backend (`dashboard-backend`)
```env
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=3001
```

#### Bookkeeping Backend (`bookkeeping-backend`)
```env
DASHBOARD_API_URL=https://kpi-dashboard-backend.onrender.com/api
ENABLE_KPI_INTEGRATION=true
```

## Demo Data

The dashboard includes sample KPIs from the bookkeeping app in demo sessions:

- 9 pre-populated financial and operational KPIs
- 1 revenue trend chart
- All KPIs show realistic values with percentage changes
- Data is session-isolated for multi-user demos

## Security

- **Session-based isolation**: KPIs are scoped to user sessions
- **Authentication required**: All API endpoints require valid session ID
- **Input validation**: All KPI data is validated before storage
- **SQL injection protection**: Uses parameterized queries
- **CORS configuration**: Restricted to trusted origins

## Future Enhancements

- [ ] Webhook support for push notifications
- [ ] KPI aggregation across time periods
- [ ] Custom KPI formulas and calculations
- [ ] Alert triggers based on KPI thresholds
- [ ] Historical KPI tracking and trends
- [ ] Export external KPIs to CSV/Excel
- [ ] API key authentication for external apps

## Troubleshooting

### KPIs Not Appearing

1. **Check session ID**: Ensure the same session ID is used in both apps
2. **Verify API URL**: Check `DASHBOARD_API_URL` environment variable
3. **Check network**: Ensure dashboard backend is reachable
4. **Review logs**: Check backend logs for errors

### Connection Errors

```
[KPI Sender] Failed to send KPIs to dashboard: connect ECONNREFUSED
```

**Solution**: Verify the dashboard backend is running and the API URL is correct.

### Session Expired

```
{ error: 'Invalid or expired session' }
```

**Solution**: Session may have expired (24h lifetime). Create a new session by logging in again.

## Support

For issues or questions:
- Email: mario.muja@gmail.com
- Phone: +49 1520 464 1473
- GitHub: https://github.com/mariomuja/dashboard

---

**Last Updated**: November 2025  
**Version**: 1.0.0

