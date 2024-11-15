import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';
@Component({
  selector: 'app-confirmar-pago',
  templateUrl: './confirmar-pago.component.html',
  styleUrls: ['./confirmar-pago.component.scss'],
  imports : [IonButton, CommonModule],
  standalone : true,
})
export class ConfirmarPagoComponent implements OnInit {
  pedidos: any[] = [];

  constructor(private firestoreService: FirestoreService, private router: Router) {}

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
    await this.firestoreService.deleteDocument(`listaPedidos/${pedidoId}`);
    this.pedidos = this.pedidos.filter(pedido => pedido.id !== pedidoId);
  }
}
