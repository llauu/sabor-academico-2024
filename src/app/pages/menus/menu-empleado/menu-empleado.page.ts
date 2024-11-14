import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { SpinnerComponent } from 'src/app/componentes/spinner/spinner.component';
import { addIcons } from 'ionicons';
import { checkbox, logOutOutline } from 'ionicons/icons';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service';
import { IonicModule } from '@ionic/angular';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-menu-empleado',
  templateUrl: './menu-empleado.page.html',
  styleUrls: ['./menu-empleado.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule ]
})
export class MenuEmpleadoPage implements OnInit {

  pedidos: any[] = [];

  constructor(private firestore: Firestore, private firestoreService: FirestoreService, private userService: UserService, private router: Router) { 
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.cargarPedidos();
  }

  async cargarPedidos() {
    const pedidosData = await this.firestoreService.getPedidos();
    
    pedidosData.forEach((pedido: any) => {
      console.log('Pedido completo:', pedido);
    });
    
    this.pedidos = pedidosData.filter((pedido: any) => pedido.cocina?.estado === 'pendiente');
  }

  /*getRol() {
    return this.userProfile.rol;
  }*/
  
  async marcarRealizado(pedidoId: string) {
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'cocina.estado': 'realizado'
    });
    this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedidoId);
  }

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
}
