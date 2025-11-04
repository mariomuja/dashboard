# Advanced Analytics Component - Fixes Needed

## Issues Found:

1. **forecast() method** - Line 111
   - Current: `{ method: this.selectedForecastMethod }`
   - Expected: Direct value `this.selectedForecastMethod`
   - But component uses: 'arima' | 'prophet' | 'exponential' | 'linear'
   - Service expects: 'arima' | 'prophet' | 'exponential-smoothing' | 'linear-regression'

2. **cohortAnalysis() method** - Line 153
   - Current: `{ metric: 'retention' }`
   - Expected: `'month'` (periodType: 'day' | 'week' | 'month')

3. **funnelAnalysis() method** - Line 190-192
   - Properties `users`, `conversionRate`, `dropoffRate` don't exist on FunnelStage
   - Correct properties: `count`, `percentage`, `conversionFromPrevious`, `dropoff`

4. **abTestAnalysis() method** - Line 228
   - Current: `{ confidenceLevel: 0.95, testType: 'two-tailed' }`
   - Expected: Just `0.95` (confidence level number)

5. **Result properties** - Lines 242, 244
   - `result.significant` doesn't exist, use `result.statisticalSignificance`
   - `result.uplift` doesn't exist, use `result.effect.relative`

