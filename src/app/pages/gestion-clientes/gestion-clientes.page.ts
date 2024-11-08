import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../services/firestore.service';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-gestion-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-clientes.page.html',
  styleUrls: ['./gestion-clientes.page.scss']
})
export class GestionClientesPage implements OnInit {
  clientes: { nombre: string; id: string }[] = []; // lista de clientes pendiente

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.obtenerClientes();
  }

  async obtenerClientes() {
    try {
      // Llamada al servicio para obtener usuarios pendientes
      const snapshot = await this.firestoreService.getUsuariosPendientes<any>('usuarios');
      this.clientes = snapshot.docs.map((doc: QueryDocumentSnapshot<any>) => ({
        id: doc.id,
        nombre: doc.data().nombre
      }));
      console.log("Clientes pendientes cargados:", this.clientes);
    } catch (error) {
      console.error("Error al obtener clientes pendientes:", error);
    }
  }

  onAceptar(cliente: { id: string; nombre: string }) {
    console.log("Cliente aceptado:", cliente.nombre);
    // Aquí puedes añadir la lógica para actualizar el estado del cliente a aceptado en Firestore.
  }

  onRechazar(cliente: { id: string; nombre: string }) {
    console.log("Cliente rechazado:", cliente.nombre);
    // Aquí puedes añadir la lógica para actualizar el estado del cliente a rechazado en Firestore.
  }
}
