import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { SpinnerComponent } from 'src/app/componentes/spinner/spinner.component';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Chart } from 'chart.js';


@Component({
  selector: 'app-menu-mozo',
  templateUrl: './menu-mozo.page.html',
  styleUrls: ['./menu-mozo.page.scss'],
  standalone: true,
  imports: [    MatIconModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, SpinnerComponent, IonIcon, IonButton]
})
export class MenuMozoPage implements OnInit {

  private currentAudio: HTMLAudioElement | null = null;
  loading!: HTMLIonLoadingElement;
  public audioInicioSesion = new Audio('../../../../assets/logOut.mp3');
  public audio = new Audio('../../../../assets/inicioSesion.mp3');

  constructor(private userService: UserService, public router: Router) { 
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.currentAudio = this.audio;
    this.playAudio(this.audio);
    addIcons({ logOutOutline });
  }

  playAudio(audio: HTMLAudioElement) {
    audio.load();
    audio.play().catch(err => console.error('Error al reproducir el audio:', err));
  }
  
  confirmarPedidos() {
    this.router.navigate(['/confirmar-pedidos']);
  }

  abrirChat() {
    this.router.navigate(['/chat-mozo']);
  }

  confirmarPagos() {
    this.router.navigate(['/confirmar-pago']);
  }

  confirmLogout() {
    sweetAlertConfig.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003049',
      cancelButtonColor: '#D62828',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Cerrar sesión',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.logOut();
      }
    });
  }

  logOut() {
    this.userService.logout()
      .then(() => {
        this.currentAudio = this.audioInicioSesion;
        this.playAudio(this.audioInicioSesion);
        this.router.navigate(['/login']);
      });
  }
}
