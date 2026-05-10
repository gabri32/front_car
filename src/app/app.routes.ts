import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { RegistroMoto } from './registro-moto/registro-moto';
import { Estadisticas } from './estadisticas/estadisticas';
import { SalidaMoto } from './salida-moto/salida-moto';
import { Login } from './login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', component: Dashboard },
      { path: 'registro-moto', component: RegistroMoto },
      { path: 'estadisticas', component: Estadisticas },
      { path: 'salida-moto', component: SalidaMoto }
    ]
  },
  { path: '**', redirectTo: '' }
];
