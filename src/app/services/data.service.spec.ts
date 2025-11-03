import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return KPI data', (done) => {
    service.getKpiData().subscribe(data => {
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
  });

  it('should return revenue data', (done) => {
    service.getRevenueData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toBeDefined();
      expect(data[0].value).toBeDefined();
      done();
    });
  });

  it('should return sales data', (done) => {
    service.getSalesData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toBeDefined();
      expect(data[0].value).toBeDefined();
      done();
    });
  });

  it('should return conversion data', (done) => {
    service.getConversionData().subscribe(data => {
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toBeDefined();
      expect(data[0].value).toBeDefined();
      done();
    });
  });
});

