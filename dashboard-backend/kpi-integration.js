// KPI Integration Module - Receives KPIs from External Applications
const { Pool } = require('pg');

class KPIIntegration {
  constructor() {
    this.useDatabase = !!process.env.DATABASE_URL;
    
    if (this.useDatabase) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    }
  }

  /**
   * Receive KPI from external application
   * @param {string} sessionId - User's session ID
   * @param {object} kpiData - KPI data from external app
   */
  async receiveExternalKPI(sessionId, kpiData) {
    const {
      sourceApp,
      sourceAppDisplay,
      kpiName,
      kpiValue,
      kpiUnit = '',
      kpiChange = 0,
      kpiIcon = '📊',
      kpiColor = 'blue',
      chartType = null,
      chartData = null,
      description = '',
      category = 'general',
      displayOrder = 0
    } = kpiData;

    if (!this.useDatabase) {
      console.log(`[KPI Integration] Received KPI from ${sourceApp}: ${kpiName} = ${kpiValue}`);
      return { success: true, message: 'KPI received (in-memory mode)' };
    }

    try {
      const result = await this.pool.query(`
        INSERT INTO external_kpis (
          session_id, source_app, source_app_display, kpi_name, kpi_value,
          kpi_unit, kpi_change, kpi_icon, kpi_color, chart_type, chart_data,
          description, category, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (session_id, source_app, kpi_name) 
        DO UPDATE SET 
          kpi_value = $5,
          kpi_change = $7,
          chart_data = $11,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        sessionId, sourceApp, sourceAppDisplay, kpiName, kpiValue,
        kpiUnit, kpiChange, kpiIcon, kpiColor, chartType, 
        chartData ? JSON.stringify(chartData) : null,
        description, category, displayOrder
      ]);

      console.log(`[KPI Integration] Stored KPI: ${sourceApp} → ${kpiName}`);
      return { success: true, kpi: result.rows[0] };
    } catch (error) {
      console.error('[KPI Integration] Error storing KPI:', error);
      throw error;
    }
  }

  /**
   * Get all external KPIs for a session
   */
  async getExternalKPIs(sessionId) {
    if (!this.useDatabase) {
      return [];
    }

    try {
      const result = await this.pool.query(`
        SELECT * FROM external_kpis
        WHERE session_id = $1 AND is_active = TRUE
        ORDER BY source_app, display_order, kpi_name
      `, [sessionId]);

      return result.rows;
    } catch (error) {
      console.error('[KPI Integration] Error fetching KPIs:', error);
      return [];
    }
  }

  /**
   * Get KPIs grouped by source application
   */
  async getKPIsBySource(sessionId) {
    const kpis = await this.getExternalKPIs(sessionId);
    
    const grouped = {};
    kpis.forEach(kpi => {
      if (!grouped[kpi.source_app]) {
        grouped[kpi.source_app] = {
          sourceApp: kpi.source_app,
          sourceAppDisplay: kpi.source_app_display,
          kpis: []
        };
      }
      grouped[kpi.source_app].kpis.push(kpi);
    });

    return Object.values(grouped);
  }

  /**
   * Batch receive multiple KPIs from an application
   */
  async receiveKPIBatch(sessionId, sourceApp, sourceAppDisplay, kpis) {
    const results = [];
    for (const kpi of kpis) {
      const result = await this.receiveExternalKPI(sessionId, {
        sourceApp,
        sourceAppDisplay,
        ...kpi
      });
      results.push(result);
    }
    return results;
  }
}

module.exports = new KPIIntegration();

