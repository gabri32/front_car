import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

export interface MotoActiva {
  id_moto: number;
  placa: string;
  fecha_ingreso: string;
  dia_mes: number;
  mes: number;
  anio: number;
  gabeta: number;
  cascos: number;
  fecha_salida: string | null;
  valor_salida: number | null;
}

export interface CalculoSalida {
  horas: number;
  total: number;
}

// Pasos del flujo:
// 'lista'      → tabla de motos activas
// 'calculando' → spinner mientras llama /admin/salida
// 'cobro'      → muestra horas + valor editable + botón "Registrar salida final"
// 'listo'      → salida registrada, vuelve a lista
type Paso = 'lista' | 'calculando' | 'cobro';

@Component({
  selector: 'app-salida-moto',
  imports: [FormsModule, CommonModule, DatePipe],
  templateUrl: './salida-moto.html',
  styleUrl: './salida-moto.css'
})
export class SalidaMoto implements OnInit {
  motos          = signal<MotoActiva[]>([]);
  motoSeleccionada = signal<MotoActiva | null>(null);
  calculo        = signal<CalculoSalida | null>(null);
  valorFinal     = signal<number>(0);
  paso           = signal<Paso>('lista');

  mensaje        = signal('');
  error          = signal('');
  errorCalculo   = signal('');
  cargandoLista  = signal(false);
  cargandoFinal  = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarMotosActivas();
  }

  cargarMotosActivas() {
    this.cargandoLista.set(true);
    this.http.get<MotoActiva[]>('http://localhost:3000/admin/obtenerMotos').subscribe({
      next: (res) => {
        const activas = res.filter(m => m.fecha_salida === null && m.valor_salida === null);
        this.motos.set(activas);
        this.cargandoLista.set(false);
      },
      error: () => this.cargandoLista.set(false)
    });
  }

  // Paso 1 → 2: seleccionar moto y calcular cobro
  calcularCobro(moto: MotoActiva) {
    this.motoSeleccionada.set(moto);
    this.calculo.set(null);
    this.valorFinal.set(0);
    this.error.set('');
    this.errorCalculo.set('');
    this.paso.set('calculando');

    this.http.post<CalculoSalida>('http://localhost:3000/admin/salida', { placa: moto.placa }).subscribe({
      next: (res) => {
        this.calculo.set(res);
        this.valorFinal.set(res.total);
        this.paso.set('cobro');
      },
      error: (err) => {
        this.errorCalculo.set(err?.error?.message || 'No se pudo calcular el valor.');
        // Igual pasamos a cobro para que el usuario pueda ingresar el valor manualmente
        this.paso.set('cobro');
      }
    });
  }

  // Paso 2 → lista: cancelar
  cancelar() {
    this.motoSeleccionada.set(null);
    this.calculo.set(null);
    this.valorFinal.set(0);
    this.error.set('');
    this.errorCalculo.set('');
    this.paso.set('lista');
  }

  // Paso 2 → confirmar salida final
  registrarSalidaFinal() {
    const moto = this.motoSeleccionada();
    if (!moto) return;

    this.cargandoFinal.set(true);
    this.error.set('');

    this.http.post('http://localhost:3000/admin/salidaFinal', {
      id_moto: moto.id_moto,
      valor_salida: this.valorFinal()
    }).subscribe({
      next: () => {
        this.mensaje.set(`✅ Salida de ${moto.placa.toUpperCase()} registrada. Valor cobrado: $${this.valorFinal()}`);
        this.motoSeleccionada.set(null);
        this.calculo.set(null);
        this.cargandoFinal.set(false);
        this.paso.set('lista');
        this.cargarMotosActivas();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al registrar la salida.');
        this.cargandoFinal.set(false);
      }
    });
  }
}
