# 🧮 Calculated Metrics & Formula Builder Guide

Complete guide to creating custom KPIs with formulas, aggregations, and running totals.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [Formula Syntax](#formula-syntax)
5. [Built-in Functions](#built-in-functions)
6. [Variables](#variables)
7. [Advanced Features](#advanced-features)
8. [Examples](#examples)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Calculated Metrics system allows you to create custom KPIs by writing formulas that combine existing data sources. Think of it as Excel formulas for your dashboard.

### Key Capabilities

- ✅ **Custom Formula Engine** - Write mathematical expressions with variables
- ✅ **10+ Built-in Functions** - SUM, AVG, MIN, MAX, GROWTH, IF, and more
- ✅ **Variable System** - Pull data from KPIs, charts, data sources, or constants
- ✅ **Aggregations** - Sum, average, min, max, count, median, std dev
- ✅ **Running Totals** - Calculate cumulative values over time
- ✅ **Real-time Validation** - Catch errors before saving
- ✅ **Test Calculator** - Preview results with sample data
- ✅ **Import/Export** - Share metrics across dashboards

---

## Features

### 1. Formula Builder UI

Access at: `http://localhost:4200/formula-builder`

**Main Interface:**
- Metrics grid with category filters
- Search and status filters
- Quick actions (edit, test, toggle, delete)
- Statistics dashboard

**Formula Editor:**
- Syntax-highlighted formula input
- Variable management
- Function reference panel
- Real-time validation
- Operators quick-insert

**Test Calculator:**
- Input test values
- See calculation results
- View execution time
- Debug formula logic

---

## Formula Syntax

### Basic Operators

```
+   Addition
-   Subtraction
*   Multiplication
/   Division
()  Parentheses for grouping
<   Less than
>   Greater than
=   Equal (use in IF function)
!   Not equal
```

### Formula Rules

1. **Variable Names**: Must start with a letter, can contain letters, numbers, underscores
2. **Function Calls**: Use uppercase (e.g., `SUM(a, b, c)`)
3. **Parentheses**: Must be balanced
4. **Division by Zero**: Returns 0 automatically
5. **Case Sensitivity**: Variable names are case-sensitive

### Example Formulas

```javascript
// Simple calculation
revenue / customers

// Using functions
AVG(metric1, metric2, metric3)

// Complex expression
(revenue - cost) / revenue * 100

// Conditional logic
IF(revenue > 1000, revenue * 0.1, revenue * 0.05)

// Growth calculation
GROWTH(current_month, previous_month)
```

---

## Built-in Functions

### Mathematical Functions

#### **SUM(...values)**
Sum of all values
```javascript
SUM(jan, feb, mar, apr)  // Returns: jan + feb + mar + apr
```

#### **AVG(...values)**
Average of all values
```javascript
AVG(10, 20, 30)  // Returns: 20
```

#### **MIN(...values)**
Minimum value
```javascript
MIN(sales_q1, sales_q2, sales_q3)  // Returns lowest quarter
```

#### **MAX(...values)**
Maximum value
```javascript
MAX(100, 200, 150)  // Returns: 200
```

#### **ABS(value)**
Absolute value
```javascript
ABS(-50)  // Returns: 50
```

#### **SQRT(value)**
Square root
```javascript
SQRT(16)  // Returns: 4
```

#### **POW(base, exponent)**
Power function
```javascript
POW(2, 3)  // Returns: 8 (2^3)
```

#### **ROUND(value, decimals)**
Round to N decimal places
```javascript
ROUND(3.14159, 2)  // Returns: 3.14
```

### Business Functions

#### **GROWTH(current, previous)**
Calculate growth percentage
```javascript
GROWTH(1200, 1000)  // Returns: 20 (20% growth)
// Formula: ((current - previous) / previous) * 100
```

### Logical Functions

#### **IF(condition, true_value, false_value)**
Conditional logic
```javascript
IF(revenue > 10000, 100, 50)
// If revenue > 10000, return 100, else return 50
```

---

## Variables

Variables connect your formulas to actual data sources.

### Variable Definition

Each variable has:
- **Name**: Unique identifier used in formulas
- **Source**: Where data comes from
- **Source ID**: Specific data source identifier
- **Field**: Which field to read (optional)
- **Default Value**: Fallback if data not available

### Source Types

#### 1. **KPI**
Pull data from dashboard KPI cards
```javascript
{
  name: "revenue",
  source: "kpi",
  sourceId: "revenue",  // KPI card ID
  field: "value",       // Current value
  defaultValue: 0
}
```

Available KPI fields:
- `value` - Current value
- `previousValue` - Previous period
- `trend` - up/down/stable
- `normalized` - 0-100 normalized value

#### 2. **Chart**
Pull data from charts
```javascript
{
  name: "avg_sales",
  source: "chart",
  sourceId: "sales-chart",
  field: "average",
  defaultValue: 0
}
```

#### 3. **Data Source**
Pull from external data sources
```javascript
{
  name: "db_value",
  source: "datasource",
  sourceId: "postgres-1",
  field: "total_count",
  defaultValue: 0
}
```

#### 4. **Constant**
Fixed value
```javascript
{
  name: "tax_rate",
  source: "constant",
  sourceId: "",
  defaultValue: 0.15  // 15%
}
```

---

## Advanced Features

### Aggregations

Apply aggregation functions to data series:

- **sum** - Total of all values
- **avg** - Average (mean)
- **min** - Minimum value
- **max** - Maximum value
- **count** - Number of data points
- **median** - Middle value
- **stddev** - Standard deviation

**Example:**
```javascript
// Metric with aggregation
{
  formula: "data_series",
  aggregation: "sum",
  variables: [...]
}
```

### Running Totals

Calculate cumulative values over time:

```javascript
// Enable running total
{
  formula: "daily_revenue",
  runningTotal: true,
  variables: [...]
}
```

The system automatically adds previous values to create running totals.

### Format Options

Display results in different formats:

- **number**: `1,234.56`
- **currency**: `$1,234.56`
- **percentage**: `12.34%`
- **text**: `1234.56` (no formatting)

**Example:**
```javascript
{
  format: "currency",
  decimals: 2
}
```

### Categories

Organize metrics:

- **kpi** - Key Performance Indicators
- **financial** - Revenue, profit, costs
- **operational** - Efficiency, productivity
- **custom** - User-defined

---

## Examples

### Example 1: Revenue Per Customer

```javascript
// Metric Definition
{
  name: "Revenue Per Customer",
  description: "Average revenue generated per customer",
  formula: "total_revenue / total_customers",
  category: "financial",
  format: "currency",
  decimals: 2,
  variables: [
    {
      name: "total_revenue",
      source: "kpi",
      sourceId: "revenue",
      field: "value",
      defaultValue: 0
    },
    {
      name: "total_customers",
      source: "kpi",
      sourceId: "customers",
      field: "value",
      defaultValue: 1  // Avoid division by zero
    }
  ]
}

// Result: $245.67
```

### Example 2: Growth Rate

```javascript
// Metric Definition
{
  name: "Month-over-Month Growth",
  description: "Percentage change from previous month",
  formula: "GROWTH(current_month, previous_month)",
  category: "kpi",
  format: "percentage",
  decimals: 1,
  variables: [
    {
      name: "current_month",
      source: "kpi",
      sourceId: "revenue",
      field: "value",
      defaultValue: 0
    },
    {
      name: "previous_month",
      source: "kpi",
      sourceId: "revenue",
      field: "previousValue",
      defaultValue: 0
    }
  ]
}

// Result: 15.3%
```

### Example 3: Weighted Score

```javascript
// Metric Definition
{
  name: "Performance Score",
  description: "Weighted average of key metrics",
  formula: "(revenue * 0.4) + (customers * 0.3) + (conversion * 0.3)",
  category: "kpi",
  format: "number",
  decimals: 0,
  variables: [
    {
      name: "revenue",
      source: "kpi",
      sourceId: "revenue",
      field: "normalized",  // 0-100 scale
      defaultValue: 50
    },
    {
      name: "customers",
      source: "kpi",
      sourceId: "customers",
      field: "normalized",
      defaultValue: 50
    },
    {
      name: "conversion",
      source: "kpi",
      sourceId: "conversion",
      field: "normalized",
      defaultValue: 50
    }
  ]
}

// Result: 75
```

### Example 4: Conditional Bonus

```javascript
// Metric Definition
{
  name: "Sales Bonus",
  description: "Bonus based on sales target achievement",
  formula: "IF(sales > target, sales * 0.1, sales * 0.05)",
  category: "financial",
  format: "currency",
  decimals: 2,
  variables: [
    {
      name: "sales",
      source: "kpi",
      sourceId: "revenue",
      field: "value",
      defaultValue: 0
    },
    {
      name: "target",
      source: "constant",
      sourceId: "",
      defaultValue: 10000
    }
  ]
}

// If sales = 12000: Result = $1,200.00 (10% bonus)
// If sales = 8000:  Result = $400.00 (5% bonus)
```

### Example 5: Running Total

```javascript
// Metric Definition
{
  name: "Cumulative Revenue",
  description: "Total revenue accumulated over time",
  formula: "daily_revenue",
  category: "financial",
  format: "currency",
  decimals: 2,
  runningTotal: true,
  variables: [
    {
      name: "daily_revenue",
      source: "kpi",
      sourceId: "revenue",
      field: "value",
      defaultValue: 0
    }
  ]
}

// Day 1: $1,000
// Day 2: $1,500 (cumulative: $2,500)
// Day 3: $1,200 (cumulative: $3,700)
```

---

## API Reference

### CalculatedMetricsService

#### **createMetric(metric: Partial<CalculatedMetric>): CalculatedMetric**
Create a new calculated metric

```typescript
const metric = metricsService.createMetric({
  name: 'My Metric',
  formula: 'a + b',
  variables: [...]
});
```

#### **updateMetric(id: string, updates: Partial<CalculatedMetric>): void**
Update an existing metric

```typescript
metricsService.updateMetric('metric-123', {
  formula: 'a * 2 + b',
  enabled: true
});
```

#### **deleteMetric(id: string): void**
Delete a metric

```typescript
metricsService.deleteMetric('metric-123');
```

#### **getAllMetrics(): CalculatedMetric[]**
Get all metrics

```typescript
const metrics = metricsService.getAllMetrics();
```

#### **getEnabledMetrics(): CalculatedMetric[]**
Get only enabled metrics

```typescript
const activeMetrics = metricsService.getEnabledMetrics();
```

#### **validateFormula(formula: string, variables: MetricVariable[]): FormulaValidation**
Validate a formula

```typescript
const validation = metricsService.validateFormula(
  'a + b * c',
  [...variables]
);

if (validation.valid) {
  console.log('Formula is valid!');
} else {
  console.error('Errors:', validation.errors);
}
```

#### **calculate(metricId: string, dataContext: Record<string, any>): CalculationResult**
Calculate a metric value

```typescript
const result = metricsService.calculate('metric-123', {
  kpi_revenue: { value: 1000 },
  kpi_customers: { value: 50 }
});

console.log(result.formattedValue);  // "$20.00"
console.log(result.value);           // 20
console.log(result.metadata.calculationTime);  // 1.23ms
```

#### **calculateBatch(metricIds: string[], dataContext: Record<string, any>): CalculationResult[]**
Calculate multiple metrics at once

```typescript
const results = metricsService.calculateBatch(
  ['metric-1', 'metric-2', 'metric-3'],
  dataContext
);
```

---

## Troubleshooting

### Common Errors

#### "Undefined variable: varName"

**Cause:** Variable used in formula but not defined in variables list

**Solution:** Add the variable to the variables list:
```typescript
variables: [
  { name: 'varName', source: 'kpi', sourceId: 'revenue', field: 'value', defaultValue: 0 }
]
```

#### "Unmatched parenthesis"

**Cause:** Missing opening or closing parenthesis

**Solution:** Check parentheses are balanced:
```javascript
// Wrong:
((a + b) * c

// Correct:
((a + b) * c)
```

#### "Formula did not return a valid number"

**Cause:** Formula returns NaN, Infinity, or non-numeric value

**Solution:** 
- Check for division by zero
- Ensure all variables have valid default values
- Use IF() to handle edge cases

#### "Calculation failed: Division by zero"

**Cause:** Denominator is zero

**Solution:** Use default values or conditional logic:
```javascript
// Add safety check
IF(denominator > 0, numerator / denominator, 0)

// Or set default value
variables: [
  { name: 'denominator', ..., defaultValue: 1 }
]
```

### Performance Tips

1. **Cache Results:** Metric results are automatically cached. Clear cache with `clearCache()` if needed.

2. **Simplify Formulas:** Complex nested functions can be slow. Break into multiple metrics if needed.

3. **Use Aggregations:** When working with series data, use built-in aggregations instead of manual loops.

4. **Default Values:** Always set sensible default values to avoid errors when data is unavailable.

---

## Best Practices

### 1. Naming Conventions

```javascript
// Good
name: "Revenue Per Customer"
variable.name: "total_revenue"

// Bad
name: "RPC"
variable.name: "r"
```

### 2. Documentation

Always add descriptions:
```javascript
description: "Calculates the average revenue generated per customer"
```

### 3. Error Handling

Use IF() to handle edge cases:
```javascript
// Avoid division by zero
IF(customers > 0, revenue / customers, 0)

// Handle negative values
IF(value < 0, ABS(value), value)
```

### 4. Testing

Always test your formulas:
1. Click "🧪 Test" button
2. Enter realistic test values
3. Verify the result makes sense
4. Test edge cases (zeros, negatives, very large/small numbers)

### 5. Version Control

Export your metrics regularly:
1. Click "📤 Export" in Formula Builder
2. Save JSON file
3. Import on other dashboards or as backup

---

## Integration with Dashboard

### Display Calculated Metrics

Calculated metrics can be displayed like regular KPIs:

```typescript
// In your component
const result = this.calculatedMetricsService.calculate('metric-id', {
  kpi_revenue: this.revenueData,
  kpi_customers: this.customersData
});

this.displayValue = result.formattedValue;
```

### Real-time Updates

Metrics are calculated on-demand with current data:

```typescript
// Recalculate when data changes
this.dataService.getData().subscribe(data => {
  this.updateCalculatedMetrics(data);
});
```

### Batch Calculations

For performance, calculate multiple metrics at once:

```typescript
const enabledMetrics = this.metricsService.getEnabledMetrics();
const metricIds = enabledMetrics.map(m => m.id);
const results = this.metricsService.calculateBatch(metricIds, dataContext);
```

---

## Support & Resources

### Documentation Files
- `CALCULATED-METRICS-GUIDE.md` (this file)
- `ADVANCED-ANALYTICS-GUIDE.md`
- `README.md`

### Example Metrics

The system includes 5 pre-built metrics:
1. Revenue Growth %
2. Customer Lifetime Value
3. Total Revenue (Running)
4. Conversion Efficiency
5. Performance Score

View these in the Formula Builder for reference.

### Getting Help

1. **Validation Errors:** Click "✓ Validate" to see detailed error messages
2. **Test Calculator:** Use "🧪 Test" to debug formulas with sample data
3. **Function Reference:** Check the right panel in Formula Builder for function docs

---

## Updates & Changelog

### Version 1.0.0 (Current)

**Features:**
- ✅ Complete formula engine with 10+ functions
- ✅ Variable system with 4 source types
- ✅ Real-time formula validation
- ✅ Test calculator
- ✅ Aggregations (7 types)
- ✅ Running totals
- ✅ Import/Export
- ✅ Comprehensive UI
- ✅ localStorage persistence
- ✅ Performance caching

**Known Limitations:**
- Maximum 50 variables per metric
- Formula execution timeout: 5 seconds
- No async data sources yet
- No custom function definitions (coming soon)

---

## Contact & Support

For questions or issues with Calculated Metrics:

📧 Email: mario@dashboard.com  
💬 GitHub: https://github.com/dashboard/issues  
📚 Docs: http://localhost:4200/formula-builder

---

**Happy Calculating!** 🧮

