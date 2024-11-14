import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service';
import { IonicModule } from '@ionic/angular';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
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

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService,
    private userService: UserService,
    private router: Router
  ) {
    addIcons({ logOutOutline });
  }

  ngOnInit() {
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

  async marcarRealizado(pedidoId: string) {
      if(this.userProfile.rol === "bartender")
      {
        await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
          'bar.estado': 'listo para servir'
        });
      }
      else
      {
        await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
          'cocina.estado': 'listo para servir'
        });
      }
      await this.validarEstado(pedidoId);

    this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedidoId);
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
    Swal.fire({
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
        this.router.navigate(['/login']);
      });
  }
  ngOnDestroy() {
    if (this.pedidosSubscription) {
      this.pedidosSubscription.unsubscribe();
    }
  }
}
