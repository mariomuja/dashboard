import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from '../../../app/services/data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return KPI data for month period', (done) => {
    const mockDashboardData = {
      kpi: {
        week: [],
        month: [
          {
            id: '1',
            title: 'Test',
            value: '$100',
            change: 5,
            trend: 'up',
            icon: '💰',
            color: '#10b981'
          }
        ],
        year: []
      },
      revenue: { week: [], month: [], year: [] },
      sales: { week: [], month: [], year: [] },
      conversion: { week: [], month: [], year: [] }
    };

    service.getKpiData('month').subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBeDefined();
      expect(data[0].title).toBeDefined();
      expect(data[0].value).toBeDefined();
      expect(data[0].change).toBeDefined();
      expect(data[0].trend).toBeDefined();
      expect(data[0].icon).toBeDefined();
      expect(data[0].color).toBeDefined();
      done();
    });

    const req = httpMock.expectOne('assets/data/dashboard-data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDashboardData);
  });

  it('should return revenue data for week period', (done) => {
    const mockDashboardData = {
      kpi: { week: [], month: [], year: [] },
      revenue: {
        week: [{ label: 'Mon', value: 1000 }],
        month: [],
        year: []
      },
      sales: { week: [], month: [], year: [] },
      conversion: { week: [], month: [], year: [] }
    };

    service.getRevenueData('week').subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toBeDefined();
      expect(data[0].value).toBeDefined();
      done();
    });

    const req = httpMock.expectOne('assets/data/dashboard-data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDashboardData);
  });

  it('should return sales data for year period', (done) => {
    const mockDashboardData = {
      kpi: { week: [], month: [], year: [] },
      revenue: { week: [], month: [], year: [] },
      sales: {
        week: [],
        month: [],
        year: [{ label: '2024', value: 3000 }]
      },
      conversion: { week: [], month: [], year: [] }
    };

    service.getSalesData('year').subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toBeDefined();
      expect(data[0].value).toBeDefined();
      done();
    });

    const req = httpMock.expectOne('assets/data/dashboard-data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDashboardData);
  });

  it('should return conversion data for month period', (done) => {
    const mockDashboardData = {
      kpi: { week: [], month: [], year: [] },
      revenue: { week: [], month: [], year: [] },
      sales: { week: [], month: [], year: [] },
      conversion: {
        week: [],
        month: [{ label: 'Jan', value: 3.5 }],
        year: []
      }
    };

    service.getConversionData('month').subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toBeDefined();
      expect(data[0].value).toBeDefined();
      done();
    });

    const req = httpMock.expectOne('assets/data/dashboard-data.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDashboardData);
  });
});


