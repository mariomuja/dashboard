import { TestBed } from '@angular/core/testing';
import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  let service: WebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have connection status', () => {
    expect(service.isConnected()).toBe(false);
  });

  it('should provide data update observable', () => {
    const observable = service.onDataUpdate();
    expect(observable).toBeDefined();
  });
});

