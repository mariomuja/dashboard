import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private dataUpdates$ = new Subject<any>();
  private connected = false;

  connect(url: string = 'http://localhost:3001'): void {
    if (this.connected) {
      return;
    }

    try {
      this.socket = io(url, {
        transports: ['websocket'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.connected = false;
      });

      this.socket.on('dataUpdate', (data: any) => {
        console.log('Received data update:', data);
        this.dataUpdates$.next(data);
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
      });
    } catch (error) {
      console.warn('WebSocket connection failed (server may not be running):', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  onDataUpdate(): Observable<any> {
    return this.dataUpdates$.asObservable();
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Emit events
  emit(event: string, data: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }
}

