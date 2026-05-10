import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit, OnDestroy {
  collapsed      = signal(false);
  minutosRestantes = signal(0);
  private timer: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.actualizarTiempo();
    // Actualiza cada minuto y verifica si la sesión expiró
    this.timer = setInterval(() => {
      this.actualizarTiempo();
      if (!this.auth.autenticado()) {
        this.router.navigate(['/login']);
      }
    }, 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private actualizarTiempo() {
    this.minutosRestantes.set(this.auth.minutosRestantes());
  }

  toggle() {
    this.collapsed.update(v => !v);
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
