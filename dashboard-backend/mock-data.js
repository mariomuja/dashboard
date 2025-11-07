// Mock Data for KPI Dashboard Demo

module.exports = {
  // Sample dashboard data
  dashboardData: {
    kpis: [
      {
        id: '1',
        title: 'Total Revenue',
        value: '$125,430',
        change: '+12.5%',
        trend: 'up',
        category: 'financial'
      },
      {
        id: '2',
        title: 'Active Users',
        value: '8,432',
        change: '+8.2%',
        trend: 'up',
        category: 'users'
      },
      {
        id: '3',
        title: 'Conversion Rate',
        value: '3.24%',
        change: '-2.1%',
        trend: 'down',
        category: 'performance'
      },
      {
        id: '4',
        title: 'Customer Satisfaction',
        value: '4.8/5.0',
        change: '+0.3',
        trend: 'up',
        category: 'satisfaction'
      }
    ],
    charts: [
      {
        id: 'revenue-trend',
        type: 'line',
        title: 'Revenue Trend',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [45000, 48000, 52000, 54000, 58000, 62000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }]
        }
      },
      {
        id: 'user-growth',
        type: 'bar',
        title: 'User Growth',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'New Users',
            data: [320, 450, 380, 520, 490, 610],
            backgroundColor: '#3b82f6'
          }]
        }
      }
    ]
  },

  // Sample external KPIs (from bookkeeping app)
  externalKPIs: [
    {
      id: 'ext-1',
      title: 'Total Assets',
      value: '$245,680',
      change: '+5.3%',
      trend: 'up',
      source: 'BookKeeper Pro',
      category: 'financial',
      priority: 10
    },
    {
      id: 'ext-2',
      title: 'Monthly Revenue',
      value: '$62,000',
      change: '+12.8%',
      trend: 'up',
      source: 'BookKeeper Pro',
      category: 'financial',
      priority: 9,
      chart: {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue',
            data: [45000, 48000, 52000, 54000, 58000, 62000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)'
          }]
        }
      }
    },
    {
      id: 'ext-3',
      title: 'Operating Expenses',
      value: '$38,200',
      change: '-3.2%',
      trend: 'down',
      source: 'BookKeeper Pro',
      category: 'financial',
      priority: 8
    }
  ]
};


