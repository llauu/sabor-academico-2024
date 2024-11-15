import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import {UserService} from '../../services/user.service'
@Component({
  selector: 'app-confirmar-pago',
  templateUrl: './confirmar-pago.component.html',
  styleUrls: ['./confirmar-pago.component.scss'],
  imports : [IonButton, CommonModule],
  standalone : true,
})
export class ConfirmarPagoComponent implements OnInit {
  pedidos: any[] = [];

  constructor(private firestoreService: FirestoreService, private router: Router,private userService: UserService) {}

  ngOnInit() {
    this.cargarPedidosPagados();
  }

  menuMozo(){
    this.router.navigate(['/menu-mozo'])
  }

  cargarPedidosPagados() {
    this.firestoreService.getPedidos().subscribe((pedidosData) => {
      this.pedidos = pedidosData.filter((pedido: any) => pedido.estado === 'pagado');
    });
  }

  async confirmarPago(pedidoId: string) {
    // Eliminar el pedido de la vista
    this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedidoId);
    console.log("pedido id " + pedidoId);
  
    try {
      
      const pedidoData: any = await this.firestoreService.getPedidoByUid(pedidoId);

      const userId = pedidoData.userID;

      const mesaSnapshot: any = await this.firestoreService.getMesaPorUserID(userId);
      if (mesaSnapshot) {
        const mesaUid = mesaSnapshot.id;
        await this.firestoreService.updateDocument(`listaMesas/${mesaUid}`, {
          'userID': ''
        });
      } else {
        console.log('No se encontró ninguna mesa para el usuario.');
      }
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
    }
    await this.firestoreService.deleteDocument(`listaPedidos/${pedidoId}`);
  }
  
}
