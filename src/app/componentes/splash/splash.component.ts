import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'splash-screen',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  standalone: true
})
export class SplashComponent {
  constructor(private router: Router) {
    this.redirectToHome();
  }

  private redirectToHome() {
    setTimeout(() => {
      this.router.navigate(['/login'], { replaceUrl: true }); // Asegúrate de tener la ruta correcta
    }, 6000); // 5000 milisegundos = 5 segundos
  }
}
