import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface MotoRegistrada {
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

@Component({
  selector: 'app-registro-moto',
  imports: [FormsModule, CommonModule, RouterLink, DatePipe],
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
  motoRegistrada = signal<MotoRegistrada | null>(null);

  constructor(private http: HttpClient) {}

  registrar() {
    if (!this.placa || this.cascos === null || this.gabeta === null) {
      this.error.set('Todos los campos son obligatorios.');
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.error.set('');
    this.motoRegistrada.set(null);

    const body = {
      placa: this.placa,
      cascos: this.cascos,
      gabeta: this.gabeta
    };

    this.http.post<MotoRegistrada>('http://localhost:3000/admin/createMoto', body).subscribe({
      next: (res) => {
        this.motoRegistrada.set(res);
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

  getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] ?? '';
  }

  imprimirRecibo() {
    const moto = this.motoRegistrada();
    if (!moto) return;

    const fecha = new Date(moto.fecha_ingreso);
    const horaStr = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fechaStr = `${moto.dia_mes} de ${this.getNombreMes(moto.mes)} de ${moto.anio}`;

    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Ingreso</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            width: 72mm;
            color: #000;
          }
          .wrap {
            padding: 4mm 3mm 2mm 3mm;
            display: inline-block;
            width: 100%;
          }
          .titulo {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            text-transform: uppercase;
            margin-bottom: 1px;
          }
          .subtitulo {
            text-align: center;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 1px;
          }
          .factura {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .separador {
            border: none;
            border-top: 1px dashed #000;
            margin: 4px 0;
          }
          .fila {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 14px;
            line-height: 1.3;
          }
          .fila .etiqueta {
            font-weight: bold;
            text-transform: uppercase;
          }
          .fila .valor {
            text-align: right;
          }
          .placa-grande {
            text-align: center;
            font-size: 26px;
            font-weight: bold;
            letter-spacing: 6px;
            margin: 5px 0;
            border: 2px solid #000;
            padding: 4px 2px;
          }
          .pie {
            text-align: center;
            font-size: 12px;
            margin-top: 5px;
            line-height: 1.5;
          }
          @media print {
            html, body { width: 72mm; }
            @page { margin: 0; size: 80mm auto; }
          }
        </style>
      </head>
      <body>
      <div class="wrap">
        <div class="titulo">PARKING</div>
        <div class="subtitulo">Parqueadero</div>
        <hr class="separador">
        <div class="factura">Factura de Venta</div>
        <hr class="separador">

        <div class="fila">
          <span class="etiqueta">Ticket:</span>
          <span class="valor">${moto.id_moto}</span>
        </div>
        <div class="fila">
          <span class="etiqueta">Fecha:</span>
          <span class="valor">${fechaStr}</span>
        </div>
        <div class="fila">
          <span class="etiqueta">Hora:</span>
          <span class="valor">${horaStr}</span>
        </div>

        <hr class="separador">

        <div class="placa-grande">${moto.placa}</div>

        <hr class="separador">

        <div class="fila">
          <span class="etiqueta">Cascos:</span>
          <span class="valor">${moto.cascos}</span>
        </div>
        <div class="fila">
          <span class="etiqueta">Gabeta:</span>
          <span class="valor">${moto.gabeta}</span>
        </div>
        <div class="fila">
          <span class="etiqueta">Salida:</span>
          <span class="valor">${moto.fecha_salida ?? 'Pendiente'}</span>
        </div>
        <div class="fila">
          <span class="etiqueta">Valor:</span>
          <span class="valor">${moto.valor_salida != null ? '$' + moto.valor_salida : 'Pendiente'}</span>
        </div>

        <hr class="separador">
        <div class="pie">Gracias por su visita</div>
        <div class="pie">Conserve este recibo</div>
      </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank', 'width=320,height=500');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => {
        ventana.print();
        ventana.close();
      }, 300);
    }
  }
}
