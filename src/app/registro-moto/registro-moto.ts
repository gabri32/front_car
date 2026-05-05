import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-moto',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './registro-moto.html',
  styleUrl: './registro-moto.css'
})
export class RegistroMoto {
  placa = '';
  cascos: number | null = null;
  gabeta: number | null = null;

  mensaje = signal('');
  error = signal('');
  cargando = signal(false);

  constructor(private http: HttpClient) {}

  registrar() {
    if (!this.placa || this.cascos === null || this.gabeta === null) {
      this.error.set('Todos los campos son obligatorios.');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.error.set('');

    const body = {
      placa: this.placa,
      cascos: this.cascos,
      gabeta: this.gabeta
    };

    this.http.post('http://localhost:3000/admin/createMoto', body).subscribe({
      next: () => {
        this.mensaje.set('Moto registrada exitosamente.');
        this.placa = '';
        this.cascos = null;
        this.gabeta = null;
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al registrar la moto.');
        this.cargando.set(false);
      }
    });
  }
}
