import { Component, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule, RouterLink],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit {
  datos = signal<any>(null);
  cargando = signal(true);
  error = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.http.get('http://localhost:3000/admin/estadisticas').subscribe({
      next: (res) => {
        this.datos.set(res);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al cargar estadísticas.');
        this.cargando.set(false);
      }
    });
  }
}
