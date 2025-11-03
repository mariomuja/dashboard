# KPI Dashboard

A modern, responsive KPI dashboard built with Angular 17.

## Features

- 📊 **KPI Cards**: Display key performance indicators with trend indicators
- 📈 **Interactive Charts**: Revenue, sales, and conversion rate charts
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Clean and intuitive interface
- ⏱️ **Time Period Selection**: Filter data by week, month, or year

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

## License

MIT



