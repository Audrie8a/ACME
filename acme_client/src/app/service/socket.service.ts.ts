// socket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

interface EstadoResponse {
  success: boolean;
  count: number;
  data: any[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketServiceTs {
  private socket!: Socket;
  private readonly serverUrl = 'http://localhost:3000';
  private connectionStatus = new Subject<boolean>();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.setupConnectionEvents();
  }

  private setupConnectionEvents(): void {
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.io');
      this.connectionStatus.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor Socket.io');
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Error de conexión Socket.io:', err);
    });
  }

  /**
   * Establece filtros para los estados
   * @param filter { vin?: string, estado?: string }
   */
  setFilter(filter: { vin?: string, estado?: string }): void {
    const formattedFilter: any = {};
    
    if (filter.vin) {
      formattedFilter.vin = filter.vin.toUpperCase();
    }
    
    if (filter.estado) {
      formattedFilter.estado = filter.estado;
    }

    this.socket.emit('setFilter', formattedFilter);
  }

  /**
   * Escucha actualizaciones de estados filtrados
   */
  onEstadoActualizado(): Observable<EstadoResponse> {
    return new Observable<EstadoResponse>(observer => {
      const handler = (data: EstadoResponse) => {
        console.log('Datos actualizados recibidos:', data);
        observer.next(data);
      };

      this.socket.on('estado_actualizado', handler);

      return () => {
        this.socket.off('estado_actualizado', handler);
      };
    });
  }

  /**
   * Escucha errores del socket
   */
  onSocketError(): Observable<{ error: string }> {
    return new Observable(observer => {
      const handler = (error: { error: string }) => {
        console.error('Error del socket:', error);
        observer.next(error);
      };

      this.socket.on('socket_error', handler);

      return () => {
        this.socket.off('socket_error', handler);
      };
    });
  }

  /**
   * Obtiene lista de VINs disponibles
   */
  getAvailableVins(): Observable<string[]> {
    return new Observable<string[]>(observer => {
      if (!this.socket.connected) {
        observer.error('Socket no conectado');
        return;
      }

      const handler = (vins: string[]) => {
        observer.next(vins);
        observer.complete();
      };

      this.socket.once('availableVins', handler);
      this.socket.emit('getVins');
    });
  }

  /**
   * Estado de conexión del socket
   */
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Desconectar manualmente
   */
  disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Reconectar manualmente
   */
  reconnect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }
}