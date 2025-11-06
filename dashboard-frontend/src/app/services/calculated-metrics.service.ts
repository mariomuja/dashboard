import { Injectable } from '@angular/core';

/**
 * Calculated Metric Definition
 */
export interface CalculatedMetric {
  id: string;
  name: string;
  description: string;
  formula: string;
  category: 'kpi' | 'financial' | 'operational' | 'custom';
  format: 'number' | 'currency' | 'percentage' | 'text';
  decimals: number;
  variables: MetricVariable[];
  aggregation?: AggregationType;
  runningTotal?: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  enabled: boolean;
}

/**
 * Variable used in formulas
 */
export interface MetricVariable {
  name: string;
  source: 'kpi' | 'chart' | 'datasource' | 'constant';
  sourceId: string;
  field?: string;
  defaultValue?: number;
}

/**
 * Aggregation types for data
 */
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'stddev';

/**
 * Formula validation result
 */
export interface FormulaValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  usedVariables: string[];
}

/**
 * Calculation result
 */
export interface CalculationResult {
  metricId: string;
  value: number;
  formattedValue: string;
  timestamp: Date;
  metadata: {
    calculationTime: number;
    variablesUsed: Record<string, number>;
    formula: string;
  };
}

/**
 * Formula Function Definition
 */
interface FormulaFunction {
  name: string;
  args: number;
  execute: (...args: number[]) => number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalculatedMetricsService {
  private metrics: CalculatedMetric[] = [];
  private cache: Map<string, CalculationResult> = new Map();
  
  // Built-in formula functions
  private readonly FUNCTIONS: Record<string, FormulaFunction> = {
    SUM: {
      name: 'SUM',
      args: -1, // Variable number of args
      execute: (...values: number[]) => values.reduce((a, b) => a + b, 0),
      description: 'Sum of all values'
    },
    AVG: {
      name: 'AVG',
      args: -1,
      execute: (...values: number[]) => values.reduce((a, b) => a + b, 0) / values.length,
      description: 'Average of all values'
    },
    MIN: {
      name: 'MIN',
      args: -1,
      execute: (...values: number[]) => Math.min(...values),
      description: 'Minimum value'
    },
    MAX: {
      name: 'MAX',
      args: -1,
      execute: (...values: number[]) => Math.max(...values),
      description: 'Maximum value'
    },
    ABS: {
      name: 'ABS',
      args: 1,
      execute: (value: number) => Math.abs(value),
      description: 'Absolute value'
    },
    ROUND: {
      name: 'ROUND',
      args: 2,
      execute: (value: number, decimals: number) => Number(value.toFixed(decimals)),
      description: 'Round to N decimals'
    },
    SQRT: {
      name: 'SQRT',
      args: 1,
      execute: (value: number) => Math.sqrt(value),
      description: 'Square root'
    },
    POW: {
      name: 'POW',
      args: 2,
      execute: (base: number, exp: number) => Math.pow(base, exp),
      description: 'Power (base^exponent)'
    },
    IF: {
      name: 'IF',
      args: 3,
      execute: (condition: number, trueVal: number, falseVal: number) => condition ? trueVal : falseVal,
      description: 'Conditional: IF(condition, true_value, false_value)'
    },
    GROWTH: {
      name: 'GROWTH',
      args: 2,
      execute: (current: number, previous: number) => previous === 0 ? 0 : ((current - previous) / previous) * 100,
      description: 'Growth percentage: ((current - previous) / previous) * 100'
    }
  };

  constructor() {
    this.loadMetrics();
    this.createDefaultMetrics();
  }

  /**
   * Create default calculated metrics
   */
  private createDefaultMetrics(): void {
    if (this.metrics.length === 0) {
      const defaults: Partial<CalculatedMetric>[] = [
        {
          name: 'Revenue Growth %',
          description: 'Percentage growth in revenue compared to previous period',
          formula: 'GROWTH(revenue_current, revenue_previous)',
          category: 'financial',
          format: 'percentage',
          decimals: 2,
          variables: [
            { name: 'revenue_current', source: 'kpi', sourceId: 'revenue', field: 'value' },
            { name: 'revenue_previous', source: 'kpi', sourceId: 'revenue', field: 'previousValue' }
          ],
          enabled: true
        },
        {
          name: 'Customer Lifetime Value',
          description: 'Average revenue per customer',
          formula: 'revenue / customers',
          category: 'kpi',
          format: 'currency',
          decimals: 2,
          variables: [
            { name: 'revenue', source: 'kpi', sourceId: 'revenue', field: 'value' },
            { name: 'customers', source: 'kpi', sourceId: 'customers', field: 'value' }
          ],
          enabled: true
        },
        {
          name: 'Total Revenue (Running)',
          description: 'Running total of revenue over time',
          formula: 'revenue',
          category: 'financial',
          format: 'currency',
          decimals: 2,
          variables: [
            { name: 'revenue', source: 'kpi', sourceId: 'revenue', field: 'value' }
          ],
          runningTotal: true,
          enabled: true
        },
        {
          name: 'Conversion Efficiency',
          description: 'Conversion rate multiplied by order value',
          formula: '(conversion / 100) * orderValue',
          category: 'operational',
          format: 'currency',
          decimals: 2,
          variables: [
            { name: 'conversion', source: 'kpi', sourceId: 'conversion', field: 'value' },
            { name: 'orderValue', source: 'kpi', sourceId: 'orderValue', field: 'value' }
          ],
          enabled: true
        },
        {
          name: 'Performance Score',
          description: 'Weighted average of key metrics',
          formula: '(revenue * 0.4) + (customers * 0.3) + (conversion * 0.3)',
          category: 'kpi',
          format: 'number',
          decimals: 0,
          variables: [
            { name: 'revenue', source: 'kpi', sourceId: 'revenue', field: 'normalized' },
            { name: 'customers', source: 'kpi', sourceId: 'customers', field: 'normalized' },
            { name: 'conversion', source: 'kpi', sourceId: 'conversion', field: 'normalized' }
          ],
          enabled: true
        }
      ];

      defaults.forEach(def => this.createMetric(def));
    }
  }

  /**
   * Create a new calculated metric
   */
  createMetric(metric: Partial<CalculatedMetric>): CalculatedMetric {
    const newMetric: CalculatedMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: metric.name || 'Untitled Metric',
      description: metric.description || '',
      formula: metric.formula || '',
      category: metric.category || 'custom',
      format: metric.format || 'number',
      decimals: metric.decimals ?? 2,
      variables: metric.variables || [],
      aggregation: metric.aggregation,
      runningTotal: metric.runningTotal || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      enabled: metric.enabled ?? true
    };

    this.metrics.push(newMetric);
    this.saveMetrics();
    console.log(`Created calculated metric: ${newMetric.name}`);
    return newMetric;
  }

  /**
   * Update an existing metric
   */
  updateMetric(id: string, updates: Partial<CalculatedMetric>): void {
    const index = this.metrics.findIndex(m => m.id === id);
    if (index > -1) {
      this.metrics[index] = {
        ...this.metrics[index],
        ...updates,
        updatedAt: new Date()
      };
      this.saveMetrics();
      this.cache.delete(id); // Invalidate cache
      console.log(`Updated calculated metric: ${id}`);
    }
  }

  /**
   * Delete a metric
   */
  deleteMetric(id: string): void {
    const index = this.metrics.findIndex(m => m.id === id);
    if (index > -1) {
      this.metrics.splice(index, 1);
      this.saveMetrics();
      this.cache.delete(id);
      console.log(`Deleted calculated metric: ${id}`);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): CalculatedMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metric by ID
   */
  getMetricById(id: string): CalculatedMetric | undefined {
    return this.metrics.find(m => m.id === id);
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string): CalculatedMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get enabled metrics
   */
  getEnabledMetrics(): CalculatedMetric[] {
    return this.metrics.filter(m => m.enabled);
  }

  /**
   * Validate a formula
   */
  validateFormula(formula: string, variables: MetricVariable[]): FormulaValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const usedVariables: string[] = [];

    try {
      // Check for empty formula
      if (!formula || formula.trim().length === 0) {
        errors.push('Formula cannot be empty');
        return { valid: false, errors, warnings, usedVariables };
      }

      // Find all variable names in formula
      const variablePattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
      const matches = formula.match(variablePattern) || [];
      
      for (const match of matches) {
        // Skip function names
        if (this.FUNCTIONS[match.toUpperCase()]) {
          continue;
        }
        
        // Check if variable is defined
        const varDef = variables.find(v => v.name === match);
        if (!varDef) {
          errors.push(`Undefined variable: ${match}`);
        } else if (!usedVariables.includes(match)) {
          usedVariables.push(match);
        }
      }

      // Check for balanced parentheses
      let parenCount = 0;
      for (const char of formula) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (parenCount < 0) {
          errors.push('Unmatched closing parenthesis');
          break;
        }
      }
      if (parenCount > 0) {
        errors.push('Unmatched opening parenthesis');
      }

      // Check for unused variables
      for (const variable of variables) {
        if (!usedVariables.includes(variable.name)) {
          warnings.push(`Variable "${variable.name}" is defined but not used`);
        }
      }

      // Test evaluation with sample data
      try {
        const testData: Record<string, number> = {};
        variables.forEach(v => {
          testData[v.name] = v.defaultValue || 100;
        });
        this.evaluateFormula(formula, testData);
      } catch (error: any) {
        errors.push(`Formula evaluation error: ${error.message}`);
      }

    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      usedVariables
    };
  }

  /**
   * Calculate metric value
   */
  calculate(metricId: string, dataContext: Record<string, any> = {}): CalculationResult {
    const metric = this.getMetricById(metricId);
    if (!metric) {
      throw new Error(`Metric not found: ${metricId}`);
    }

    if (!metric.enabled) {
      throw new Error(`Metric is disabled: ${metric.name}`);
    }

    const startTime = performance.now();

    try {
      // Resolve variable values from data context
      const variableValues: Record<string, number> = {};
      for (const variable of metric.variables) {
        const value = this.resolveVariableValue(variable, dataContext);
        variableValues[variable.name] = value;
      }

      // Evaluate formula
      let value = this.evaluateFormula(metric.formula, variableValues);

      // Apply aggregation if specified
      if (metric.aggregation && Array.isArray(dataContext['series'])) {
        value = this.applyAggregation(dataContext['series'], metric.aggregation);
      }

      // Apply running total if enabled
      if (metric.runningTotal && dataContext['runningTotalBase'] !== undefined) {
        value += dataContext['runningTotalBase'];
      }

      // Format value
      const formattedValue = this.formatValue(value, metric.format, metric.decimals);

      const calculationTime = performance.now() - startTime;

      const result: CalculationResult = {
        metricId: metric.id,
        value,
        formattedValue,
        timestamp: new Date(),
        metadata: {
          calculationTime,
          variablesUsed: variableValues,
          formula: metric.formula
        }
      };

      // Cache result
      this.cache.set(metricId, result);

      return result;
    } catch (error: any) {
      throw new Error(`Calculation failed for "${metric.name}": ${error.message}`);
    }
  }

  /**
   * Batch calculate multiple metrics
   */
  calculateBatch(metricIds: string[], dataContext: Record<string, any> = {}): CalculationResult[] {
    return metricIds.map(id => {
      try {
        return this.calculate(id, dataContext);
      } catch (error: any) {
        console.error(`Failed to calculate metric ${id}:`, error);
        return null;
      }
    }).filter((r): r is CalculationResult => r !== null);
  }

  /**
   * Evaluate a formula with given variable values
   */
  private evaluateFormula(formula: string, variables: Record<string, number>): number {
    try {
      // Replace function calls with JavaScript equivalents
      let processedFormula = formula;
      
      for (const [name, func] of Object.entries(this.FUNCTIONS)) {
        const regex = new RegExp(`\\b${name}\\s*\\(`, 'gi');
        processedFormula = processedFormula.replace(regex, `this.executeFunction('${name}',`);
      }

      // Replace variables with values
      for (const [name, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\b${name}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, value.toString());
      }

      // Create evaluation context
      const context = {
        executeFunction: (funcName: string, ...args: number[]) => {
          const func = this.FUNCTIONS[funcName.toUpperCase()];
          if (!func) {
            throw new Error(`Unknown function: ${funcName}`);
          }
          return func.execute(...args);
        }
      };

      // Use Function constructor for safe evaluation
      const evalFunc = new Function('context', `with(context) { return ${processedFormula}; }`);
      const result = evalFunc(context);

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Formula did not return a valid number');
      }

      return result;
    } catch (error: any) {
      throw new Error(`Formula evaluation failed: ${error.message}`);
    }
  }

  /**
   * Resolve variable value from data context
   */
  private resolveVariableValue(variable: MetricVariable, dataContext: Record<string, any>): number {
    try {
      if (variable.source === 'constant') {
        return variable.defaultValue || 0;
      }

      // Try to get value from data context
      const contextKey = `${variable.source}_${variable.sourceId}`;
      if (dataContext[contextKey] !== undefined) {
        const data = dataContext[contextKey];
        if (variable.field && typeof data === 'object') {
          return Number(data[variable.field]) || 0;
        }
        return Number(data) || 0;
      }

      // Fallback to default value
      return variable.defaultValue || 0;
    } catch (error) {
      console.warn(`Failed to resolve variable ${variable.name}, using default`, error);
      return variable.defaultValue || 0;
    }
  }

  /**
   * Apply aggregation to data series
   */
  private applyAggregation(series: number[], type: AggregationType): number {
    if (!series || series.length === 0) return 0;

    switch (type) {
      case 'sum':
        return series.reduce((a, b) => a + b, 0);
      case 'avg':
        return series.reduce((a, b) => a + b, 0) / series.length;
      case 'min':
        return Math.min(...series);
      case 'max':
        return Math.max(...series);
      case 'count':
        return series.length;
      case 'median':
        const sorted = [...series].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      case 'stddev':
        const mean = series.reduce((a, b) => a + b, 0) / series.length;
        const variance = series.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / series.length;
        return Math.sqrt(variance);
      default:
        return 0;
    }
  }

  /**
   * Format value based on format type
   */
  private formatValue(value: number, format: string, decimals: number): string {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
      case 'percentage':
        return `${value.toFixed(decimals)}%`;
      case 'number':
        return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      case 'text':
        return value.toString();
      default:
        return value.toFixed(decimals);
    }
  }

  /**
   * Get available functions
   */
  getAvailableFunctions(): FormulaFunction[] {
    return Object.values(this.FUNCTIONS);
  }

  /**
   * Clear calculation cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Calculation cache cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): any {
    return {
      totalMetrics: this.metrics.length,
      enabledMetrics: this.metrics.filter(m => m.enabled).length,
      byCategory: {
        kpi: this.metrics.filter(m => m.category === 'kpi').length,
        financial: this.metrics.filter(m => m.category === 'financial').length,
        operational: this.metrics.filter(m => m.category === 'operational').length,
        custom: this.metrics.filter(m => m.category === 'custom').length
      },
      cacheSize: this.cache.size,
      totalFunctions: Object.keys(this.FUNCTIONS).length
    };
  }

  /**
   * Load metrics from localStorage
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem('calculated_metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics = parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        }));
        console.log(`Loaded ${this.metrics.length} calculated metrics`);
      }
    } catch (error) {
      console.error('Failed to load calculated metrics', error);
    }
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    try {
      localStorage.setItem('calculated_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to save calculated metrics', error);
    }
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Import metrics from JSON
   */
  importMetrics(json: string): void {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        imported.forEach(m => this.createMetric(m));
        console.log(`Imported ${imported.length} metrics`);
      }
    } catch (error) {
      console.error('Failed to import metrics', error);
      throw new Error('Invalid JSON format');
    }
  }
}

