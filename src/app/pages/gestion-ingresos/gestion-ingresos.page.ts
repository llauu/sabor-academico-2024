import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ActionPerformed } from '@capacitor/push-notifications';
import {PushNotificationsService} from '../../services/push-notifications.service'
import Swal from 'sweetalert2';


interface Ingreso {
userUID: string,
uid: string,
userFullName: string,
id: string,
}

@Component({
  selector: 'app-gestion-clientes',
  standalone: true,
  imports: [CommonModule,IonButton],
  templateUrl: './gestion-ingresos.page.html',
  styleUrls: ['./gestion-ingresos.page.scss']
})

export class GestionIngresosPage implements OnInit {

  ingresos: Ingreso[] = []; // lista de clientes pendiente
  mesas: any[] = []; // lista de clientes pendiente
  mesaSeleccionada: any;
  

  constructor(private pushNotificationsService : PushNotificationsService ,private router : Router, private firestoreService: FirestoreService) {}

  async ngOnInit() {
    this.ingresos = await this.buscarUsuariosPendientes();
    this.mesas = await this.buscarMesasDisponibles();
    console.log(this.ingresos)
    console.log(this.mesas)
  }
  
  async onAceptar(ingreso: Ingreso) {
    try {
      await this.firestoreService.updateDocument(`listaEspera/${ingreso.id}`, { state: 'accepted' });
      console.log("Ingreso aceptado:", ingreso.userFullName);
      this.ingresos = this.ingresos.filter(i => i.userUID !== ingreso.userUID);

      // Abre el modal con SweetAlert2
      const { value: selectedTable } = await Swal.fire({
        title: 'Selecciona una mesa',
        input: 'select',
        inputOptions: {
          'Mesa 1': 'Mesa 1',
          'Mesa 2': 'Mesa 2',
          'Mesa 3': 'Mesa 3', // Agrega más mesas según sea necesario
        },
        inputPlaceholder: 'Selecciona una mesa',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');   
        }
      });

      if (selectedTable) {
        this.mesaSeleccionada = selectedTable;
        console.log("Mesa seleccionada:", this.mesaSeleccionada);
        //await this.firestoreService.updateDocument(`listaMesas/${ingreso.id}`, { state: 'accepted' });

      }
    } catch (error) {
      console.error("Error al aceptar ingreso:", error);
    }
  }

  async onRechazar(ingreso: Ingreso) {
    try {
      ///await this.firestoreService.updateDocument(`usuarios/${cliente.id}`, { estadoCliente: 'rechazado' });
      console.log("Cliente rechazado:", ingreso.userFullName);
      this.ingresos = this.ingresos.filter(i => i.userUID !== ingreso.userUID);
    } catch (error) {
      console.error("Error al rechazar el cliente:", error);
    }
  }
  navigateHome(){
    this.router.navigate(['/home']);
  }



  async buscarUsuariosPendientes(): Promise<any> {

    try {
      const documents = await this.firestoreService.getDocumentsByField<any>("listaEspera", "state", "pending");
      return documents;
    } catch (error) {
      console.error("Error al obtener documentos de la colección listaEspera con estado pending", error);
      return [];
    }
  }

  async buscarMesasDisponibles(): Promise<any> {

    try {
      const documents = await this.firestoreService.getDocumentsByField<any>("listaMesas", "userUID", "");
      return documents;
    } catch (error) {
      console.error("Error al obtener documentos de la colección listaMesas sin usuario asignado", error);
      return [];
    }
  }
}
