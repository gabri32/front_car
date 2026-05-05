import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { RegistroMoto } from './registro-moto/registro-moto';
import { Estadisticas } from './estadisticas/estadisticas';
import { SalidaMoto } from './salida-moto/salida-moto';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Dashboard },
      { path: 'registro-moto', component: RegistroMoto },
      { path: 'estadisticas', component: Estadisticas },
      { path: 'salida-moto', component: SalidaMoto }
    ]
  }
];
