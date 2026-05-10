import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  password = '';
  error    = signal('');
  mostrar  = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  ingresar() {
    if (!this.password) {
      this.error.set('Ingresa la contraseña.');
      return;
    }
    if (this.auth.login(this.password)) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Contraseña incorrecta.');
      this.password = '';
    }
  }
}
