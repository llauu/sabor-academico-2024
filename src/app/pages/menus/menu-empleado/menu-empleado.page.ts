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
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-menu-empleado',
  templateUrl: './menu-empleado.page.html',
  styleUrls: ['./menu-empleado.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule ]
})
export class MenuEmpleadoPage implements OnInit {

  pedidos: any[] = [];
  user : any ;
  userProfile : any;
  constructor(private firestore: Firestore, private firestoreService: FirestoreService, private userService: UserService, private router: Router) { 
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    console.log("antes");
    this.userService.getState()
      .then((user: any) => {
        this.user = user;

        return this.userService.getUserProfile(user.uid);
      })
      .then((userProfile: any) => {
        console.log("userProfile: ", userProfile);
        this.userProfile = userProfile;
        this.cargarPedidos();
      })
      .catch((error) => {
        console.error("Error en ngOnInit:", error);
      });
      if(this.userProfile.rol === "bartender")
      {
        
      }
  }
  

  async cargarPedidos() {
    const pedidosData = await this.firestoreService.getPedidos();
    if (this.userProfile.rol === 'bartender') {
      this.pedidos = pedidosData.filter((pedido: any) => pedido.bar?.estado === 'pendiente');
    } else if (this.userProfile.rol === 'cocinero') {
      this.pedidos = pedidosData.filter((pedido: any) => pedido.cocina?.estado === 'pendiente');
    }
  }
  
  
  async marcarRealizado(pedidoId: string) {
      if(this.userProfile.rol === "bartender")
      {
        await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
          'bar.estado': 'realizado'
        });
      }
      else
      {
        await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
          'cocina.estado': 'realizado'
        });
      }

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
