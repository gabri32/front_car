import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-salida-moto',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './salida-moto.html',
  styleUrl: './salida-moto.css'
})
export class SalidaMoto {
  placa = '';
  mensaje = signal('');
  error = signal('');
  cargando = signal(false);

  constructor(private http: HttpClient) {}

  registrarSalida() {
    if (!this.placa) {
      this.error.set('Ingresa la placa de la moto.');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.http.post('http://localhost:3000/admin/salidaMoto', { placa: this.placa }).subscribe({
      next: () => {
        this.mensaje.set('Salida registrada exitosamente.');
        this.placa = '';
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al registrar la salida.');
        this.cargando.set(false);
      }
    });
  }
}
