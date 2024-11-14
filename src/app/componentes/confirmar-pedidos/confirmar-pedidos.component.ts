import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
@Component({
  selector: 'app-confirmar-pedidos',
  templateUrl: './confirmar-pedidos.component.html',
  styleUrls: ['./confirmar-pedidos.component.scss'],
  imports : [CommonModule, IonButton],
  standalone: true,
})
export class ConfirmarPedidosComponent implements OnInit {
  pedidos: any[] = [];

  constructor(private firestoreService: FirestoreService,   private router: Router) {}

  ngOnInit() {
    this.cargarPedidosPendientes();
  }
  menuMozo(){
      this.router.navigate(['/menu-mozo'])
  }

  cargarPedidosPendientes() {
    this.firestoreService.getPedidos().subscribe((pedidosData) => {
      this.pedidos = pedidosData
        .filter((pedido: any) => pedido.estado === 'pendiente')
        .map((pedido) => ({ ...pedido, mostrarDetalles: false }));
    });
  }

  toggleDetalles(pedido: any) {
    pedido.mostrarDetalles = !pedido.mostrarDetalles;
  }

  async confirmarPedido(pedidoId: string) {
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      estado: 'derivado'
    });
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'bar.estado': 'derivado'
    });
    await this.firestoreService.updateDocument(`listaPedidos/${pedidoId}`, {
      'cocina.estado': 'derivado'
    });
    this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedidoId);
  }
}
