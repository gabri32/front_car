import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'park_auth_ts';
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 horas

@Injectable({ providedIn: 'root' })
export class AuthService {
  autenticado = signal(false);

  constructor() {
    this.verificarSesion();
  }

  private verificarSesion(): void {
    const ts = localStorage.getItem(STORAGE_KEY);
    if (!ts) return;
    const diff = Date.now() - Number(ts);
    if (diff < SESSION_DURATION_MS) {
      this.autenticado.set(true);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  login(password: string): boolean {
    if (password === environment.password) {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      this.autenticado.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.autenticado.set(false);
  }

  /** Minutos restantes de sesión */
  minutosRestantes(): number {
    const ts = localStorage.getItem(STORAGE_KEY);
    if (!ts) return 0;
    const restante = SESSION_DURATION_MS - (Date.now() - Number(ts));
    return Math.max(0, Math.floor(restante / 60000));
  }
}
