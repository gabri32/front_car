import { Component, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService } from '../services/api.service';

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

type Paso = 'lista' | 'calculando' | 'cobro';

@Component({
  selector: 'app-salida-moto',
  imports: [FormsModule, CommonModule, DatePipe],
  templateUrl: './salida-moto.html',
  styleUrl: './salida-moto.css'
})
export class SalidaMoto implements OnInit {
  motos            = signal<MotoActiva[]>([]);
  motoSeleccionada = signal<MotoActiva | null>(null);
  calculo          = signal<CalculoSalida | null>(null);
  valorFinal       = signal<number>(0);
  paso             = signal<Paso>('lista');

  placaFiltro      = signal('');
  motosFiltradas   = computed(() => {
    const filtro = this.placaFiltro().trim().toLowerCase();
    return filtro
      ? this.motos().filter(moto => moto.placa.toLowerCase().includes(filtro))
      : this.motos();
  });

  mensaje        = signal('');
  error          = signal('');
  errorCalculo   = signal('');
  cargandoLista  = signal(false);
  cargandoFinal  = signal(false);

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargarMotosActivas(); }

  cargarMotosActivas() {
    this.cargandoLista.set(true);
    this.api.obtenerMotos().subscribe({
      next: (res: MotoActiva[]) => {
        this.motos.set(res.filter(m => m.fecha_salida === null && m.valor_salida === null));
        this.cargandoLista.set(false);
      },
      error: () => this.cargandoLista.set(false)
    });
  }

  calcularCobro(moto: MotoActiva) {
    this.motoSeleccionada.set(moto);
    this.calculo.set(null);
    this.valorFinal.set(0);
    this.error.set('');
    this.errorCalculo.set('');
    this.paso.set('calculando');

    this.api.calcularSalida(moto.placa).subscribe({
      next: (res) => {
        this.calculo.set(res);
        this.valorFinal.set(res.total);
        this.paso.set('cobro');
      },
      error: (err: any) => {
        this.errorCalculo.set(err?.error?.message || 'No se pudo calcular el valor.');
        this.paso.set('cobro');
      }
    });
  }

  cancelar() {
    this.motoSeleccionada.set(null);
    this.calculo.set(null);
    this.valorFinal.set(0);
    this.error.set('');
    this.errorCalculo.set('');
    this.paso.set('lista');
  }

  registrarSalidaFinal() {
    const moto = this.motoSeleccionada();
    if (!moto) return;

    this.cargandoFinal.set(true);
    this.error.set('');

    this.api.registrarSalidaFinal(moto.id_moto, this.valorFinal()).subscribe({
      next: () => {
        this.mensaje.set(`✅ Salida de ${moto.placa.toUpperCase()} registrada. Valor cobrado: $${this.valorFinal()}`);
        this.motoSeleccionada.set(null);
        this.calculo.set(null);
        this.cargandoFinal.set(false);
        this.paso.set('lista');
        this.cargarMotosActivas();
      },
      error: (err: any) => {
        this.error.set(err?.error?.message || 'Error al registrar la salida.');
        this.cargandoFinal.set(false);
      }
    });
  }
}
