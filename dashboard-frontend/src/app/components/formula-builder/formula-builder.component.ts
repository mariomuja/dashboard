import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalculatedMetricsService, CalculatedMetric, MetricVariable, FormulaValidation } from '../../services/calculated-metrics.service';

@Component({
  selector: 'app-formula-builder',
  templateUrl: './formula-builder.component.html',
  styleUrls: ['./formula-builder.component.css']
})
export class FormulaBuilderComponent implements OnInit {
  metrics: CalculatedMetric[] = [];
  selectedMetric: CalculatedMetric | null = null;
  showEditModal = false;
  showTestModal = false;
  
  // Editing metric
  editingMetric: Partial<CalculatedMetric> = {};
  isNewMetric = false;
  
  // Formula validation
  validation: FormulaValidation | null = null;
  
  // Test calculation
  testValues: Record<string, number> = {};
  testResult: any = null;
  
  // Statistics
  statistics: any = null;
  
  // Available functions
  availableFunctions: any[] = [];
  
  // Filter
  filterCategory: string = 'all';
  filterEnabled: string = 'all';
  searchTerm = '';

  constructor(
    private metricsService: CalculatedMetricsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadStatistics();
    this.availableFunctions = this.metricsService.getAvailableFunctions();
  }

  loadMetrics(): void {
    this.metrics = this.metricsService.getAllMetrics();
  }

  loadStatistics(): void {
    this.statistics = this.metricsService.getStatistics();
  }

  get filteredMetrics(): CalculatedMetric[] {
    return this.metrics.filter(m => {
      if (this.filterCategory !== 'all' && m.category !== this.filterCategory) {
        return false;
      }
      if (this.filterEnabled === 'enabled' && !m.enabled) {
        return false;
      }
      if (this.filterEnabled === 'disabled' && m.enabled) {
        return false;
      }
      if (this.searchTerm && !m.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
          !m.description.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  selectMetric(metric: CalculatedMetric): void {
    this.selectedMetric = metric;
  }

  openNewMetricModal(): void {
    this.isNewMetric = true;
    this.editingMetric = {
      name: '',
      description: '',
      formula: '',
      category: 'custom',
      format: 'number',
      decimals: 2,
      variables: [],
      enabled: true,
      runningTotal: false
    };
    this.validation = null;
    this.showEditModal = true;
  }

  openEditModal(metric: CalculatedMetric): void {
    this.isNewMetric = false;
    this.editingMetric = { ...metric, variables: [...metric.variables] };
    this.validation = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingMetric = {};
    this.validation = null;
  }

  saveMetric(): void {
    if (!this.editingMetric.name || !this.editingMetric.formula) {
      alert('Please fill in name and formula');
      return;
    }

    // Validate formula
    this.validateCurrentFormula();
    if (this.validation && !this.validation.valid) {
      alert('Please fix formula errors before saving');
      return;
    }

    if (this.isNewMetric) {
      this.metricsService.createMetric(this.editingMetric);
    } else if (this.editingMetric.id) {
      this.metricsService.updateMetric(this.editingMetric.id, this.editingMetric);
    }

    this.loadMetrics();
    this.loadStatistics();
    this.closeEditModal();
  }

  deleteMetric(metric: CalculatedMetric): void {
    if (!confirm(`Delete metric "${metric.name}"?`)) {
      return;
    }

    this.metricsService.deleteMetric(metric.id);
    if (this.selectedMetric?.id === metric.id) {
      this.selectedMetric = null;
    }
    this.loadMetrics();
    this.loadStatistics();
  }

  toggleMetricEnabled(metric: CalculatedMetric): void {
    this.metricsService.updateMetric(metric.id, { enabled: !metric.enabled });
    this.loadMetrics();
    this.loadStatistics();
  }

  // Variable management
  addVariable(): void {
    if (!this.editingMetric.variables) {
      this.editingMetric.variables = [];
    }
    
    this.editingMetric.variables.push({
      name: `var${this.editingMetric.variables.length + 1}`,
      source: 'kpi',
      sourceId: '',
      field: 'value',
      defaultValue: 0
    });
  }

  removeVariable(index: number): void {
    if (this.editingMetric.variables) {
      this.editingMetric.variables.splice(index, 1);
    }
  }

  insertVariableToFormula(varName: string): void {
    if (!this.editingMetric.formula) {
      this.editingMetric.formula = '';
    }
    this.editingMetric.formula += varName;
  }

  insertFunctionToFormula(funcName: string, argsCount: number): void {
    if (!this.editingMetric.formula) {
      this.editingMetric.formula = '';
    }
    
    const args = Array(argsCount > 0 ? argsCount : 1).fill('').join(', ');
    this.editingMetric.formula += `${funcName}(${args})`;
  }

  // Formula validation
  validateCurrentFormula(): void {
    if (this.editingMetric.formula && this.editingMetric.variables) {
      this.validation = this.metricsService.validateFormula(
        this.editingMetric.formula,
        this.editingMetric.variables
      );
    }
  }

  // Test calculation
  openTestModal(metric: CalculatedMetric): void {
    this.selectedMetric = metric;
    this.testValues = {};
    
    // Initialize test values with defaults
    metric.variables.forEach(v => {
      this.testValues[v.name] = v.defaultValue || 100;
    });
    
    this.testResult = null;
    this.showTestModal = true;
  }

  runTestCalculation(): void {
    if (!this.selectedMetric) return;

    try {
      // Create data context from test values
      const dataContext: Record<string, any> = {};
      this.selectedMetric.variables.forEach(v => {
        const contextKey = `${v.source}_${v.sourceId}`;
        dataContext[contextKey] = { [v.field || 'value']: this.testValues[v.name] };
      });

      this.testResult = this.metricsService.calculate(this.selectedMetric.id, dataContext);
    } catch (error: any) {
      this.testResult = {
        error: error.message
      };
    }
  }

  closeTestModal(): void {
    this.showTestModal = false;
    this.testResult = null;
  }

  // Utility methods
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      kpi: '📊',
      financial: '💰',
      operational: '⚙️',
      custom: '🔧'
    };
    return icons[category] || '📈';
  }

  getFormatIcon(format: string): string {
    const icons: Record<string, string> = {
      number: '#',
      currency: '$',
      percentage: '%',
      text: 'T'
    };
    return icons[format] || '#';
  }

  clearCache(): void {
    this.metricsService.clearCache();
    alert('Calculation cache cleared');
  }

  exportMetrics(): void {
    const json = this.metricsService.exportMetrics();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculated-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importMetrics(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        this.metricsService.importMetrics(e.target.result);
        this.loadMetrics();
        this.loadStatistics();
        alert('Metrics imported successfully');
      } catch (error: any) {
        alert(`Import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}


