# Advanced Analytics Guide

## 🎯 Overview

Complete advanced analytics suite with forecasting, cohort analysis, funnel analysis, A/B testing, and statistical significance testing.

---

## ✨ Features

### ✅ Forecasting
- 📈 **ARIMA** - Auto-Regressive Integrated Moving Average
- 🔮 **Prophet** - Facebook Prophet-like algorithm
- 📊 **Exponential Smoothing** - Holt-Winters method
- 📉 **Linear Regression** - Trend-based forecasting

### ✅ Cohort Analysis
- 👥 **User Cohorts** - Group users by acquisition date
- 📊 **Retention Matrix** - Period-over-period retention
- 📈 **Retention Curves** - Visual retention trends
- 🎯 **Average Retention** - Cross-cohort metrics

### ✅ Funnel Analysis
- 🎯 **Conversion Tracking** - Multi-stage funnels
- 📉 **Drop-off Identification** - Find problem areas
- ⏱️ **Time Analysis** - Time spent per stage
- 💡 **Recommendations** - Auto-generated insights

### ✅ A/B Testing
- 🔬 **Statistical Testing** - Rigorous A/B comparisons
- 📊 **Conversion Metrics** - Rate comparisons
- 💰 **Revenue Impact** - Financial analysis
- ✅ **Winner Detection** - Automatic winner selection

### ✅ Statistical Significance
- 📊 **T-Test** - Compare means
- 🔢 **Z-Test** - Large sample testing
- ✅ **Chi-Square** - Categorical data
- 📈 **Effect Size** - Cohen's d, Cramer's V
- ⚡ **Power Analysis** - Sample size adequacy

---

## 🚀 Quick Start

### Import Service

```typescript
import { AdvancedAnalyticsService } from './services/advanced-analytics.service';

constructor(private analytics: AdvancedAnalyticsService) {}
```

---

## 📈 1. Forecasting

### Time Series Forecasting

```typescript
// Prepare historical data
const historicalData = [
  { date: new Date('2024-01-01'), value: 1000 },
  { date: new Date('2024-01-02'), value: 1050 },
  { date: new Date('2024-01-03'), value: 1100 },
  // ... more data
];

// Generate forecast
const forecast = this.analytics.forecast(
  historicalData,
  30, // Forecast 30 periods ahead
  'prophet' // Method: arima | prophet | exponential-smoothing | linear-regression
);

console.log('Forecast:', forecast);
```

### Forecast Result

```typescript
interface ForecastResult {
  method: 'arima' | 'prophet' | 'exponential-smoothing' | 'linear-regression';
  historical: DataPoint[];
  forecast: ForecastPoint[];
  confidence: ConfidenceInterval[];
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    mae: number;  // Mean Absolute Error
  };
}
```

### Use Forecast Data

```typescript
// Display forecast
forecast.forecast.forEach(point => {
  console.log(`${point.date.toDateString()}: ${point.value.toFixed(2)}`);
  console.log(`  95% CI: [${point.lower.toFixed(2)}, ${point.upper.toFixed(2)}]`);
});

// Check accuracy
console.log(`Forecast accuracy (MAPE): ${forecast.accuracy.mape}%`);
```

### Visualization

```typescript
// Prepare chart data
const chartData = {
  labels: [
    ...forecast.historical.map(d => d.date.toLocaleDateString()),
    ...forecast.forecast.map(f => f.date.toLocaleDateString())
  ],
  datasets: [
    {
      label: 'Historical',
      data: forecast.historical.map(d => d.value),
      borderColor: '#3b82f6'
    },
    {
      label: 'Forecast',
      data: [
        ...Array(forecast.historical.length).fill(null),
        ...forecast.forecast.map(f => f.value)
      ],
      borderColor: '#10b981',
      borderDash: [5, 5]
    },
    {
      label: 'Confidence Interval',
      data: [
        ...Array(forecast.historical.length).fill(null),
        ...forecast.forecast.map(f => [f.lower, f.upper])
      ],
      backgroundColor: 'rgba(16, 185, 129, 0.1)'
    }
  ]
};
```

---

## 👥 2. Cohort Analysis

### Retention Cohort Analysis

```typescript
// Prepare cohort data
const cohortData = [
  { userId: 'user1', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-01-01') },
  { userId: 'user1', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-02-01') },
  { userId: 'user2', cohortDate: new Date('2024-01-01'), eventDate: new Date('2024-01-01') },
  // ... more data
];

// Analyze cohorts
const cohortAnalysis = this.analytics.cohortAnalysis(
  cohortData,
  'month', // Period: 'day' | 'week' | 'month'
  12 // Number of periods to analyze
);

console.log('Cohort Analysis:', cohortAnalysis);
```

### Cohort Results

```typescript
// View retention matrix
cohortAnalysis.cohorts.forEach(cohort => {
  console.log(`Cohort ${cohort.name}:`);
  console.log(`  Size: ${cohort.size}`);
  console.log(`  Month 0: ${cohort.retention[0].toFixed(1)}%`);
  console.log(`  Month 1: ${cohort.retention[1].toFixed(1)}%`);
  console.log(`  Month 3: ${cohort.retention[3].toFixed(1)}%`);
});

// Average retention
console.log('Average Retention:');
cohortAnalysis.averageRetention.forEach((retention, index) => {
  console.log(`  Period ${index}: ${retention.toFixed(1)}%`);
});
```

### Retention Heatmap

```typescript
// Create heatmap data
const heatmapData = cohortAnalysis.retentionMatrix.map((row, cohortIndex) => ({
  cohort: cohortAnalysis.cohorts[cohortIndex].name,
  ...row.reduce((acc, val, periodIndex) => ({
    ...acc,
    [`period${periodIndex}`]: val
  }), {})
}));
```

---

## 🎯 3. Funnel Analysis

### Conversion Funnel

```typescript
// Define funnel stages
const funnelStages = [
  { name: 'Visited Site', users: ['u1', 'u2', 'u3', 'u4', 'u5'] },
  { name: 'Viewed Product', users: ['u1', 'u2', 'u3', 'u4'] },
  { name: 'Added to Cart', users: ['u1', 'u2', 'u3'] },
  { name: 'Initiated Checkout', users: ['u1', 'u2'] },
  { name: 'Completed Purchase', users: ['u1'] }
];

// Optional: Time spent per stage
const timeData = [
  { stage: 'Visited Site', userId: 'u1', timeSpent: 120 },
  { stage: 'Viewed Product', userId: 'u1', timeSpent: 180 },
  // ... more data
];

// Analyze funnel
const funnelAnalysis = this.analytics.funnelAnalysis(funnelStages, timeData);

console.log('Funnel Analysis:', funnelAnalysis);
```

### Funnel Results

```typescript
// View conversion rates
funnelAnalysis.stages.forEach((stage, index) => {
  console.log(`${index + 1}. ${stage.name}:`);
  console.log(`   Users: ${stage.count}`);
  console.log(`   % of Total: ${stage.percentage.toFixed(1)}%`);
  console.log(`   Conversion from Previous: ${stage.conversionFromPrevious.toFixed(1)}%`);
  console.log(`   Drop-off: ${stage.dropoff} users`);
  if (stage.averageTime) {
    console.log(`   Avg Time: ${stage.averageTime.toFixed(0)}s`);
  }
});

// Overall metrics
console.log(`Overall Conversion: ${funnelAnalysis.overallConversion.toFixed(1)}%`);

// Drop-off points
funnelAnalysis.dropoffPoints.forEach(dropoff => {
  console.log(`⚠️ High drop-off: ${dropoff.fromStage} → ${dropoff.toStage}`);
  console.log(`   Drop-off Rate: ${dropoff.dropoffRate.toFixed(1)}%`);
  console.log(`   Users Lost: ${dropoff.usersLost}`);
});

// Recommendations
funnelAnalysis.recommendations.forEach(rec => {
  console.log(`💡 ${rec}`);
});
```

### Funnel Visualization

```typescript
// Prepare funnel chart
const funnelChart = {
  labels: funnelAnalysis.stages.map(s => s.name),
  datasets: [{
    data: funnelAnalysis.stages.map(s => s.count),
    backgroundColor: [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6'
    ]
  }]
};
```

---

## 🔬 4. A/B Testing

### Run A/B Test Analysis

```typescript
// Variant A (Control)
const variantA = {
  users: 10000,
  conversions: 1200,
  revenue: 24000
};

// Variant B (Test)
const variantB = {
  users: 10000,
  conversions: 1350,
  revenue: 27000
};

// Analyze
const abTest = this.analytics.abTestAnalysis(
  variantA,
  variantB,
  0.95 // 95% confidence level
);

console.log('A/B Test Results:', abTest);
```

### A/B Test Results

```typescript
// Variant comparison
abTest.variants.forEach(variant => {
  console.log(`${variant.name}:`);
  console.log(`  Users: ${variant.users}`);
  console.log(`  Conversions: ${variant.conversions}`);
  console.log(`  Conversion Rate: ${variant.conversionRate.toFixed(2)}%`);
  if (variant.revenue) {
    console.log(`  Revenue: $${variant.revenue}`);
    console.log(`  Revenue/User: $${variant.revenuePerUser?.toFixed(2)}`);
  }
});

// Statistical significance
console.log(`P-Value: ${abTest.pValue.toFixed(4)}`);
console.log(`Statistically Significant: ${abTest.statisticalSignificance ? 'YES' : 'NO'}`);
console.log(`Confidence: ${abTest.confidence}%`);

// Effect
console.log(`Absolute Effect: ${abTest.effect.absolute.toFixed(2)}%`);
console.log(`Relative Effect: ${abTest.effect.relative.toFixed(1)}%`);
console.log(`Winner: ${abTest.winner || 'None'}`);

// Recommendation
console.log(`📊 ${abTest.recommendation}`);
```

---

## 📊 5. Statistical Significance Testing

### T-Test Example

```typescript
const sampleA = [23, 25, 27, 29, 31, 24, 26, 28, 30, 32];
const sampleB = [28, 30, 32, 34, 36, 29, 31, 33, 35, 37];

const test = this.analytics.statisticalTest(
  sampleA,
  sampleB,
  'ttest',
  0.95
);

console.log('Statistical Test:', test);
```

### Test Results

```typescript
console.log(`Test Type: ${test.testType}`);
console.log(`P-Value: ${test.pValue.toFixed(4)}`);
console.log(`Significant: ${test.isSignificant ? 'YES' : 'NO'}`);
console.log(`Confidence Level: ${test.confidenceLevel}%`);
console.log(`Effect Size (Cohen's d): ${test.effectSize.toFixed(3)}`);
console.log(`Sample Size: ${test.sampleSize}`);
console.log(`Statistical Power: ${(test.power * 100).toFixed(1)}%`);
```

### Interpret Results

```typescript
if (test.isSignificant) {
  if (test.effectSize < 0.2) {
    console.log('Small effect size');
  } else if (test.effectSize < 0.5) {
    console.log('Medium effect size');
  } else {
    console.log('Large effect size');
  }
}
```

---

## 💡 Use Cases

### 1. **Revenue Forecasting**

```typescript
// Historical revenue data
const revenueHistory = last12Months.map(month => ({
  date: month.date,
  value: month.revenue
}));

// Forecast next quarter
const forecast = analytics.forecast(revenueHistory, 90, 'prophet');

console.log('Q4 Revenue Forecast:');
forecast.forecast.slice(0, 90).forEach(f => {
  console.log(`${f.date.toDateString()}: $${f.value.toFixed(2)}`);
});
```

### 2. **User Retention Analysis**

```typescript
// User activity data
const userActivity = getUserActivityLogs(); // { userId, signupDate, activityDate }

// Analyze monthly cohorts
const cohorts = analytics.cohortAnalysis(
  userActivity.map(a => ({
    userId: a.userId,
    cohortDate: a.signupDate,
    eventDate: a.activityDate
  })),
  'month',
  12
);

// Identify retention trends
cohorts.cohorts.forEach(cohort => {
  const month6 = cohort.retention[6];
  if (month6 < 20) {
    console.warn(`Low retention in cohort ${cohort.name}: ${month6}%`);
  }
});
```

### 3. **Sales Funnel Optimization**

```typescript
// Track users through sales funnel
const funnel = analytics.funnelAnalysis([
  { name: 'Landing Page', users: getAllVisitors() },
  { name: 'Product Page', users: getProductViewers() },
  { name: 'Cart', users: getCartAdders() },
  { name: 'Checkout', users: getCheckoutStarters() },
  { name: 'Purchase', users: getPurchasers() }
]);

// Find biggest drop-off
const biggestDropoff = funnel.dropoffPoints.reduce((max, d) => 
  d.dropoffRate > max.dropoffRate ? d : max
);

console.log(`Focus on: ${biggestDropoff.fromStage} → ${biggestDropoff.toStage}`);
```

### 4. **Feature A/B Test**

```typescript
// New feature test
const control = {
  users: 5000,
  conversions: 750,
  revenue: 15000
};

const newFeature = {
  users: 5000,
  conversions: 825,
  revenue: 16500
};

const result = analytics.abTestAnalysis(control, newFeature, 0.95);

if (result.statisticalSignificance && result.effect.type === 'positive') {
  console.log('✅ Ship new feature!');
  console.log(`Expected lift: ${result.effect.relative.toFixed(1)}%`);
} else {
  console.log('⏸️ Continue testing');
}
```

### 5. **Campaign Performance Test**

```typescript
// Test campaign effectiveness
const beforeCampaign = [120, 125, 130, 128, 132];
const afterCampaign = [145, 150, 148, 152, 155];

const test = analytics.statisticalTest(
  beforeCampaign,
  afterCampaign,
  'ttest'
);

if (test.isSignificant) {
  console.log(`Campaign was effective (p=${test.pValue.toFixed(4)})`);
}
```

---

## 📊 Forecasting Methods Comparison

### ARIMA
**Best for:**
- Complex time series
- Non-stationary data
- When you have enough data (50+ points)

**Pros:**
- Handles trends and seasonality
- Good for short-term forecasts

**Cons:**
- Requires parameter tuning
- Computationally intensive

### Prophet
**Best for:**
- Business metrics
- Daily/weekly seasonality
- Holiday effects

**Pros:**
- Handles missing data
- Automatic seasonality detection
- Robust to outliers

**Cons:**
- Requires longer history
- Not for high-frequency data

### Exponential Smoothing
**Best for:**
- Simple trends
- Quick forecasts
- Real-time updates

**Pros:**
- Fast computation
- Easy to understand
- Works with less data

**Cons:**
- Less accurate for complex patterns
- Limited seasonality handling

### Linear Regression
**Best for:**
- Clear linear trends
- Simple forecasts
- Quick estimates

**Pros:**
- Very fast
- Easy to interpret
- Works with small datasets

**Cons:**
- Assumes linearity
- No seasonality
- Poor for complex patterns

---

## 📈 Cohort Analysis Types

### 1. **Acquisition Cohorts**

Group by signup/first purchase date:

```typescript
cohortAnalysis(
  users.map(u => ({
    userId: u.id,
    cohortDate: u.signupDate,
    eventDate: u.lastActive
  })),
  'month',
  12
)
```

### 2. **Behavioral Cohorts**

Group by first action:

```typescript
cohortAnalysis(
  users.map(u => ({
    userId: u.id,
    cohortDate: u.firstPurchaseDate,
    eventDate: u.lastPurchaseDate
  })),
  'month',
  12
)
```

### 3. **Revenue Cohorts**

Track revenue over time:

```typescript
// Modify to track revenue instead of retention
const revenueCohorts = cohortAnalysis(
  purchases.map(p => ({
    userId: p.userId,
    cohortDate: getUserSignupDate(p.userId),
    eventDate: p.purchaseDate
  })),
  'month',
  12
);
```

---

## 🎯 Funnel Analysis Metrics

### Key Metrics

```typescript
interface FunnelMetrics {
  // Conversion rates
  overallConversion: 20.5, // %
  stageConversions: [100, 80, 60, 40, 20.5], // %
  
  // Drop-offs
  dropoffRates: [20, 25, 33, 49], // %
  dropoffCounts: [1000, 800, 1000, 980],
  
  // Time analysis
  averageTimes: [30, 45, 120, 300, 180], // seconds
  
  // Conversion velocity
  fastestPath: 10, // minutes
  slowestPath: 120 // minutes
}
```

### Optimization Opportunities

```typescript
// Identify where to focus
funnel.dropoffPoints.forEach(dropoff => {
  if (dropoff.dropoffRate > 50) {
    console.log(`🔴 CRITICAL: ${dropoff.fromStage} → ${dropoff.toStage}`);
    console.log(`   Action: Immediate investigation required`);
  } else if (dropoff.dropoffRate > 30) {
    console.log(`🟡 HIGH: ${dropoff.fromStage} → ${dropoff.toStage}`);
    console.log(`   Action: A/B test improvements`);
  }
});
```

---

## 🔬 Statistical Testing Guide

### When to Use Each Test

**T-Test:**
- Comparing two groups
- Continuous data (revenue, time, etc.)
- Sample size: 30+

**Z-Test:**
- Large samples (100+)
- Known population variance
- Conversion rates

**Chi-Square:**
- Categorical data
- Multiple groups
- Frequency comparisons

### Sample Size Calculation

```typescript
// Minimum sample size for 80% power
const minSampleSize = calculateMinSampleSize(
  effectSize: 0.2, // Small effect
  alpha: 0.05,
  power: 0.80
);

console.log(`Need ${minSampleSize} users per variant`);
```

### Confidence Levels

- **90%**: Quick decisions, lower confidence
- **95%**: Standard for most tests ✅
- **99%**: Critical decisions, high confidence

### Effect Sizes

**Cohen's d:**
- Small: 0.2
- Medium: 0.5
- Large: 0.8+

**Interpretation:**
- < 0.2: Negligible
- 0.2-0.5: Small
- 0.5-0.8: Medium
- > 0.8: Large

---

## 📊 Complete Example Workflow

### Revenue Optimization Project

```typescript
// 1. Forecast baseline
const revenueData = getHistoricalRevenue();
const forecast = analytics.forecast(revenueData, 30, 'prophet');
console.log(`Forecasted revenue: $${forecast.forecast[29].value}`);

// 2. Analyze user retention
const cohorts = analytics.cohortAnalysis(getUserCohorts(), 'month', 12);
console.log(`Month 6 retention: ${cohorts.averageRetention[6].toFixed(1)}%`);

// 3. Optimize conversion funnel
const funnel = analytics.funnelAnalysis(getSalesFunnel());
const biggestIssue = funnel.dropoffPoints[0];
console.log(`Fix: ${biggestIssue.fromStage} → ${biggestIssue.toStage}`);

// 4. Test improvement with A/B test
const abTest = analytics.abTestAnalysis(
  { users: 1000, conversions: 120 }, // Control
  { users: 1000, conversions: 145 }  // New design
);

if (abTest.statisticalSignificance) {
  console.log(`✅ Roll out! Expected lift: ${abTest.effect.relative.toFixed(1)}%`);
}

// 5. Verify statistical significance
const test = analytics.statisticalTest(
  controlMetrics,
  variantMetrics,
  'ttest'
);

console.log(`Confidence: ${test.isSignificant ? 'High' : 'Low'}`);
```

---

## ✅ Features Summary

- ✅ **4 forecasting methods** - ARIMA, Prophet, Exponential Smoothing, Linear Regression
- ✅ **Cohort analysis** - Retention tracking by cohort
- ✅ **Funnel analysis** - Conversion optimization
- ✅ **A/B testing** - Statistical comparison
- ✅ **3 statistical tests** - T-test, Z-test, Chi-square
- ✅ **Effect size** - Cohen's d, Cramer's V
- ✅ **Power analysis** - Sample size validation
- ✅ **Confidence intervals** - 95% CI for forecasts
- ✅ **Accuracy metrics** - MAPE, RMSE, MAE
- ✅ **Recommendations** - Auto-generated insights

---

## 🎓 Statistical Concepts

### P-Value
- Probability of observing results if null hypothesis is true
- < 0.05: Statistically significant (95% confidence)
- < 0.01: Highly significant (99% confidence)

### Confidence Interval
- Range where true value likely lies
- 95% CI: 95% confidence true value is within range

### Effect Size
- Magnitude of difference
- Independent of sample size
- More meaningful than p-value alone

### Statistical Power
- Probability of detecting real effect
- Minimum 80% recommended
- Higher sample size = higher power

---

## ✅ Complete Implementation

All advanced analytics features are **fully implemented**:

- ✅ Forecasting with 4 methods
- ✅ Cohort retention analysis
- ✅ Funnel conversion tracking
- ✅ A/B test analysis
- ✅ Statistical significance testing
- ✅ Effect size calculations
- ✅ Power analysis
- ✅ Confidence intervals
- ✅ Recommendations engine

**Ready for data-driven decision making!** 📊🚀

