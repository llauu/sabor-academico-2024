import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service';
import { IonicModule } from '@ionic/angular';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
@Component({
  selector: 'app-menu-empleado',
  templateUrl: './menu-empleado.page.html',
  styleUrls: ['./menu-empleado.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule ]
})
export class MenuEmpleadoPage implements OnInit {
  pedidos: any[] = [];
  user: any;
  userProfile: any;
  pedidosSubscription: Subscription | undefined;

  private currentAudio: HTMLAudioElement | null = null;
  loading!: HTMLIonLoadingElement;
  public audioInicioSesion = new Audio('../../../../assets/logOut.mp3');
  public audio = new Audio('../../../../assets/inicioSesion.mp3');
  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService,
    private userService: UserService,
    private router: Router,
    private pushN: PushNotificationsService
  ) {
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.currentAudio = this.audio;
    this.playAudio(this.audio);
    this.userService
      .getState()
      .then((user: any) => {
        this.user = user;
        return this.userService.getUserProfile(user.uid);
      })
      .then((userProfile: any) => {
        this.userProfile = userProfile;
        this.subscribeToPedidos();
      })
      .catch((error) => {
        console.error("Error en ngOnInit:", error);
      });
  }

  playAudio(audio: HTMLAudioElement) {
    audio.load();
    audio.play().catch(err => console.error('Error al reproducir el audio:', err));
  }

  subscribeToPedidos() {
    this.pedidosSubscription = this.firestoreService.getPedidos().subscribe((pedidosData) => {
      if (this.userProfile.rol === 'bartender') {
        this.pedidos = pedidosData
          .filter((pedido: any) => pedido.bar?.estado === 'derivado')
          .map((pedido) => ({ ...pedido, mostrarDetalles: false }));
      } else if (this.userProfile.rol === 'cocinero') {
        this.pedidos = pedidosData
          .filter((pedido: any) => pedido.cocina?.estado === 'derivado')
          .map((pedido) => ({ ...pedido, mostrarDetalles: false }));
      }
    });
  }

  toggleDetalles(pedido: any) {
    pedido.mostrarDetalles = !pedido.mostrarDetalles;
  }

  async marcarRealizado(pedido: any) {
      if(this.userProfile.rol === "bartender")
      {
        await this.firestoreService.updateDocument(`listaPedidos/${pedido.id}`, {
          'bar.estado': 'listo para servir'
        });

        this.pushN.sendNotificationToRole("Pedido listo para servir!", `Los productos del sector bar de la mesa ${pedido.mesa} están listos para ser servidos.`, "mozo");
      }
      else
      {
        await this.firestoreService.updateDocument(`listaPedidos/${pedido.id}`, {
          'cocina.estado': 'listo para servir'
        });
        
        this.pushN.sendNotificationToRole("Pedido listo para servir!", `Los productos del sector cocina de la mesa ${pedido.mesa} están listos para ser servidos.`, "mozo");
      }
      await this.validarEstado(pedido.id);

    this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedido.id);
  }

  async validarEstado(pedidoId: string) {
    const pedido = await this.firestoreService.getDocument(`listaPedidos/${pedidoId}`);
    if (pedido.exists()) {
      const pedidoData : any= pedido.data();
      
      if (pedidoData.bar?.estado === 'listo para servir' && pedidoData.cocina?.estado === 'listo para servir') {
        await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
          estado: 'listo para servir'
        });
      }
    }}

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
  ngOnDestroy() {
    if (this.pedidosSubscription) {
      this.pedidosSubscription.unsubscribe();
    }
  }
}
