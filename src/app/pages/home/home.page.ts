import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, LoadingController } from '@ionic/angular/standalone';
import { FcmService } from 'src/app/services/fcm.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  loading!: HTMLIonLoadingElement;

  constructor(private userService: UserService, private router: Router, private loadingCtrl: LoadingController, private fcm: FcmService) { }

  
  cerrarSesion() {
    this.userService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      });
  }

  notificacionTest() {
    
  }
}
