import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Motos ──
  crearMoto(body: { placa: string; cascos: number; gabeta: number }): Observable<any> {
    return this.http.post(`${this.base}/admin/createMoto`, body);
  }

  obtenerMotos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/obtenerMotos`);
  }

  calcularSalida(placa: string): Observable<{ horas: number; total: number }> {
    return this.http.post<{ horas: number; total: number }>(`${this.base}/admin/salida`, { placa });
  }

  registrarSalidaFinal(id_moto: number, valor_salida: number): Observable<any> {
    return this.http.post(`${this.base}/admin/salidaFinal`, { id_moto, valor_salida });
  }
}
