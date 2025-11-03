# KPI Dashboard

A modern, responsive KPI dashboard built with Angular 17.

## Features

- 📊 **KPI Cards**: Display key performance indicators with trend indicators
- 📈 **Interactive Charts**: Revenue, sales, and conversion rate charts
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive interface
- ⏱️ **Time Period Selection**: Filter data by week, month, or year
- 📤 **Data Upload**: Upload JSON files to update dashboard data
- 🔐 **Secure Admin**: Password-protected admin panel with rate limiting

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm start
```

Navigate to `http://localhost:4200/` to view the dashboard.

## Build

Build for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Main dashboard component
│   │   ├── kpi-card/           # KPI card component
│   │   ├── revenue-chart/       # Revenue chart component
│   │   ├── sales-chart/         # Sales chart component
│   │   └── conversion-chart/    # Conversion chart component
│   ├── services/
│   │   └── data.service.ts      # Data service with mock data
│   ├── app.module.ts            # Root module
│   ├── app-routing.module.ts    # Routing configuration
│   └── app.component.*          # Root component
├── styles.css                   # Global styles
└── index.html                   # Entry HTML file
```

## Technologies Used

- Angular 17
- Chart.js (via ng2-charts)
- TypeScript
- CSS3

## Admin Panel

### Accessing Admin

1. Click "⚙️ Admin" button in the dashboard
2. Login with password: `admin123` (default)
3. Upload new dashboard data via JSON file

### Security Features

- ✅ Password authentication
- ✅ File size validation (max 1MB)
- ✅ Rate limiting (5 uploads/minute)
- ✅ File type validation (JSON only)

**Important:** Change the default password in `src/app/services/auth.service.ts` for production!

## Customization

### Option 1: Edit JSON File
1. Start the backend: `npm run start:server`
2. Access admin panel: http://localhost:4200/admin
3. Download current data
4. Edit and upload the modified file

### Option 2: Connect to Real API
Update `src/app/services/data.service.ts` to fetch from your backend API

## License

MIT



