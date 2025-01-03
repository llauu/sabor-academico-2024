import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ActionPerformed } from '@capacitor/push-notifications';
import {PushNotificationsService} from '../../services/push-notifications.service'
@Component({
  selector: 'app-gestion-clientes',
  standalone: true,
  imports: [CommonModule,IonButton],
  templateUrl: './gestion-clientes.page.html',
  styleUrls: ['./gestion-clientes.page.scss']
})
export class GestionClientesPage implements OnInit {
  clientes: {nombre: string; id: string; correo: string }[] = []; // lista de clientes pendiente

  constructor(private pushNotificationsService : PushNotificationsService ,private router : Router, private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.obtenerClientes();
  }
  

  async obtenerClientes() {
    try {
      // Llamada al servicio para obtener usuarios pendientes
      const snapshot = await this.firestoreService.getUsuariosPendientes<any>('usuarios');
      this.clientes = snapshot.docs.map((doc: QueryDocumentSnapshot<any>) => ({
        id: doc.id,
        nombre: `${doc.data().nombre } ${doc.data().apellido}`,
        correo : doc.data().correo
      }));
      console.log("Clientes pendientes cargados:", this.clientes);
    } catch (error) {
      console.error("Error al obtener clientes pendientes:", error);
    }
  }

  async onAceptar(cliente: { id: string; nombre: string; correo : string }) {
    try {
      await this.firestoreService.updateDocument(`usuarios/${cliente.id}`, { estadoCliente: 'aceptado' });
      await this.pushNotificationsService.sendMail(true,cliente.nombre,cliente.correo);
      console.log("Cliente aceptado:", cliente.nombre);
      this.clientes = this.clientes.filter(c => c.id !== cliente.id);
    } catch (error) {
      console.error("Error al aceptar el cliente:", error);
    }
  }

  async onRechazar(cliente: { id: string; nombre: string, correo : string}) {
    try {
      await this.firestoreService.updateDocument(`usuarios/${cliente.id}`, { estadoCliente: 'rechazado' });
      await this.pushNotificationsService.sendMailreject(cliente.nombre,cliente.correo);
      console.log("Cliente rechazado:", cliente.nombre);
      this.clientes = this.clientes.filter(c => c.id !== cliente.id);
    } catch (error) {
      console.error("Error al rechazar el cliente:", error);
    }
  }
  navigateHome(){
    this.router.navigate(['/menu-admin']);
  }
}
