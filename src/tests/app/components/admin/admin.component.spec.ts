import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminComponent } from '../../../../app/components/admin/admin.component';
import { DataService } from '../../../../app/services/data.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [DataService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set uploading status when uploading file', () => {
    const file = new File(['{"test": "data"}'], 'dashboard-data.json', { type: 'application/json' });
    component.uploadFile(file);
    
    expect(component.isUploading).toBe(true);
    expect(component.uploadStatus).toBe('Uploading...');
    
    // Flush the pending request
    const req = httpMock.expectOne('http://localhost:3000/api/upload/dashboard-data');
    req.flush({ success: true, message: 'Uploaded' });
  });

  it('should handle successful upload', () => {
    const file = new File(['{"test": "data"}'], 'dashboard-data.json', { type: 'application/json' });
    component.uploadFile(file);

    const req = httpMock.expectOne('http://localhost:3000/api/upload/dashboard-data');
    expect(req.request.method).toBe('POST');
    
    req.flush({ success: true, message: 'Dashboard data uploaded successfully' });

    expect(component.isUploading).toBe(false);
    expect(component.uploadStatus).toContain('✅');
  });

  it('should handle upload error', () => {
    const file = new File(['invalid'], 'dashboard-data.json', { type: 'application/json' });
    component.uploadFile(file);

    const req = httpMock.expectOne('http://localhost:3000/api/upload/dashboard-data');
    req.flush({ error: 'Invalid file' }, { status: 400, statusText: 'Bad Request' });

    expect(component.isUploading).toBe(false);
    expect(component.uploadStatus).toContain('❌');
  });

  it('should download current data', () => {
    const mockData = { 
      kpi: { week: [], month: [], year: [] },
      revenue: { week: [], month: [], year: [] },
      sales: { week: [], month: [], year: [] },
      conversion: { week: [], month: [], year: [] }
    };
    component.downloadCurrentData();

    const req = httpMock.expectOne('http://localhost:3000/api/data/dashboard-data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});

