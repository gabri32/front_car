import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

export interface MotoRegistro {
  id_moto: number;
  placa: string;
  fecha_ingreso: string;
  fecha_salida: string | null;
  valor_salida: number | null;
  dia_mes: number;
  mes: number;
  anio: number;
  gabeta: number;
  cascos: number;
}

export interface ResumenDia {
  key: string;          // "YYYY-MM-DD"
  fecha: string;        // "dd/MM/yyyy"
  dia_mes: number;
  mes: number;
  anio: number;
  total_ingresos: number;
  total_salidas: number;
  en_parqueadero: number;
  recaudo: number;      // suma de valor_salida del día
}

@Component({
  selector: 'app-estadisticas',
  imports: [CommonModule, FormsModule],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css'
})
export class Estadisticas implements OnInit {
  todasMotos = signal<MotoRegistro[]>([]);
  cargando   = signal(true);
  error      = signal('');

  // ── Filtros ──
  filtroDia   = signal('');   // "YYYY-MM-DD"
  filtroMes   = signal('');   // "YYYY-MM"
  filtroDesde = signal('');   // "YYYY-MM-DD"
  filtroHasta = signal('');   // "YYYY-MM-DD"

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.api.obtenerMotos().subscribe({
      next: (res: any[]) => { this.todasMotos.set(res); this.cargando.set(false); },
      error: (err: any) => { this.error.set(err?.error?.message || 'Error al cargar datos.'); this.cargando.set(false); }
    });
  }

  private pad(n: number) { return String(n).padStart(2, '0'); }

  private keyDia(m: MotoRegistro) {
    return `${m.anio}-${this.pad(m.mes)}-${this.pad(m.dia_mes)}`;
  }

  // ── Opciones de filtro ──
  get diasDisponibles(): string[] {
    const set = new Set(this.todasMotos().map(m => this.keyDia(m)));
    return Array.from(set).sort().reverse();
  }

  get mesesDisponibles(): string[] {
    const set = new Set(this.todasMotos().map(m => `${m.anio}-${this.pad(m.mes)}`));
    return Array.from(set).sort().reverse();
  }

  // ── Aplicar filtros ──
  get motosFiltradas(): MotoRegistro[] {
    let lista = this.todasMotos();

    if (this.filtroDia()) {
      const [a, me, d] = this.filtroDia().split('-').map(Number);
      lista = lista.filter(m => m.anio === a && m.mes === me && m.dia_mes === d);
    } else if (this.filtroMes()) {
      const [a, me] = this.filtroMes().split('-').map(Number);
      lista = lista.filter(m => m.anio === a && m.mes === me);
    } else if (this.filtroDesde() || this.filtroHasta()) {
      const desde = this.filtroDesde() ? new Date(this.filtroDesde()).getTime() : 0;
      const hasta = this.filtroHasta() ? new Date(this.filtroHasta() + 'T23:59:59').getTime() : Infinity;
      lista = lista.filter(m => {
        const t = new Date(m.fecha_ingreso).getTime();
        return t >= desde && t <= hasta;
      });
    }

    return lista;
  }

  get hayFiltroActivo(): boolean {
    return !!(this.filtroDia() || this.filtroMes() || this.filtroDesde() || this.filtroHasta());
  }

  // ── Resumen global ──
  get totalIngresos()  { return this.todasMotos().length; }
  get totalSalidas()   { return this.todasMotos().filter(m => m.fecha_salida !== null).length; }
  get enParqueadero()  { return this.todasMotos().filter(m => m.fecha_salida === null).length; }
  get recaudoTotal()   { return this.todasMotos().reduce((s, m) => s + Number(m.valor_salida ?? 0), 0); }

  // ── Resumen del período filtrado ──
  get resumenFiltrado() {
    const motos = this.motosFiltradas;
    return {
      ingresos:      motos.length,
      salidas:       motos.filter(m => m.fecha_salida !== null).length,
      enParqueadero: motos.filter(m => m.fecha_salida === null).length,
      recaudo:       motos.reduce((s, m) => s + Number(m.valor_salida ?? 0), 0),
    };
  }

  // ── Resumen por día (sobre todas las motos, no filtradas) ──
  get resumenPorDia(): ResumenDia[] {
    const mapa = new Map<string, ResumenDia>();
    for (const m of this.todasMotos()) {
      const key = this.keyDia(m);
      if (!mapa.has(key)) {
        mapa.set(key, {
          key,
          fecha: `${this.pad(m.dia_mes)}/${this.pad(m.mes)}/${m.anio}`,
          dia_mes: m.dia_mes, mes: m.mes, anio: m.anio,
          total_ingresos: 0, total_salidas: 0, en_parqueadero: 0, recaudo: 0,
        });
      }
      const r = mapa.get(key)!;
      r.total_ingresos++;
      if (m.fecha_salida !== null) { r.total_salidas++; r.recaudo += Number(m.valor_salida ?? 0); }
      else r.en_parqueadero++;
    }
    return Array.from(mapa.values()).sort((a, b) => b.key.localeCompare(a.key));
  }

  // ── Helpers ──
  limpiarFiltros() {
    this.filtroDia.set('');
    this.filtroMes.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
  }

  seleccionarDia(key: string) {
    this.limpiarFiltros();
    this.filtroDia.set(key);
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatPesos(n: number): string {
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}
