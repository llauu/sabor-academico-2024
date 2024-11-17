import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
@Component({
  selector: 'app-confirmar-pedidos',
  templateUrl: './confirmar-pedidos.component.html',
  styleUrls: ['./confirmar-pedidos.component.scss'],
  imports : [CommonModule, IonButton],
  standalone: true,
})
export class ConfirmarPedidosComponent implements OnInit {
  pedidosPendientes: any[] = [];
  pedidosParaServir: any[] = [];

  constructor(private firestoreService: FirestoreService,   private router: Router, private pushN: PushNotificationsService) {}

  ngOnInit() {
    console.log("acaaa 1");

    this.cargarPedidosPendientes();
    this.cargarPedidosListosParaServir()
  }
  menuMozo(){
      this.router.navigate(['/menu-mozo'])
  }

  cargarPedidosPendientes() {
    console.log("acaaa 2");
    
    this.firestoreService.getPedidos().subscribe((pedidosData) => {
      console.log(pedidosData);
      
      this.pedidosPendientes = pedidosData
        .filter((pedido: any) => pedido.estado === 'pendiente')
        .map((pedido) => ({ ...pedido, mostrarDetalles: false }));
    });
  }

  cargarPedidosListosParaServir() {
    console.log("acaaa 3");

    this.firestoreService.getPedidos().subscribe((pedidosData) => {
      this.pedidosParaServir = pedidosData
        .filter((pedido: any) => pedido.estado === 'listo para servir')
        .map((pedido) => ({ ...pedido, mostrarDetalles: false }));
    });
  }

  toggleDetalles(pedido: any) {
    pedido.mostrarDetalles = !pedido.mostrarDetalles;
  }

  async confirmarPedidoPendiente(pedidoId: string) {
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      estado: 'derivado'
    });
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'bar.estado': 'derivado'
    });
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'cocina.estado': 'derivado'
    });
    this.pedidosPendientes = this.pedidosPendientes.filter(pedido => pedido.id !== pedidoId);

    this.pushN.sendNotificationToRole('Nuevo pedido!', 'Hay un nuevo pedido para preparar en el sector de la cocina.', 'cocinero');
    this.pushN.sendNotificationToRole('Nuevo pedido!', 'Hay un nuevo pedido para preparar en el sector del bar.', 'bartender');
  }

  async confirmarPedidoListoParaServir(pedidoId: string) {
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      estado: 'servido'
    });
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'bar.estado': 'servido'
    });
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'cocina.estado': 'servido'
    });
    this.pedidosPendientes = this.pedidosPendientes.filter(pedido => pedido.id !== pedidoId);

    // this.pushN.sendNotificationToRole('Nuevo pedido!', 'Hay un nuevo pedido para preparar en el sector de la cocina.', 'cocinero');
    // this.pushN.sendNotificationToRole('Nuevo pedido!', 'Hay un nuevo pedido para preparar en el sector del bar.', 'bartender');
  }
}
