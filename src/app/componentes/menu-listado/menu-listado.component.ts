import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { IonicModule } from '@ionic/angular';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu-listado',
  templateUrl: './menu-listado.component.html',
  styleUrls: ['./menu-listado.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, MenuItemComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MenuListadoComponent implements OnInit {
  
  productos : any[] = []
  userID: string | null = 'vdqY9AVIQVWwrMws4eXz9lCxIjS2';
  precioTotal: number = 0;
  tiempoTotal: number = 0;

  constructor(private firestoreService: FirestoreService, private userService: UserService) {}

  async ngOnInit() {
    //this.userID = await this.userService.getId();
    this.productos = await this.firestoreService.getProductos();

    for(let p of this.productos){
      p.cantidad = 0;
      p.precioTotalProducto = 0;
    }
    console.log('Productos obtenidos:', this.productos);
  }

  toggleProduct(product: any) {
    product.expanded = !product.expanded;
  }

  increaseQuantity(product: any, event: Event) {
    event.stopPropagation();
    product.cantidad++;
    product.precioTotalProducto = product.cantidad * product.precio;
  }

  decreaseQuantity(product: any, event: Event) {
    event.stopPropagation();
    if (product.cantidad > 0) {
      product.cantidad--;
      product.precioTotalProducto = product.cantidad * product.precio;
    }
  }

  getTotalPrice() {
    return this.precioTotal = this.productos.reduce((acc, product) => acc + product.precioTotalProducto, 0);
  }

  getTotalTime() {
    // Obtiene el tiempo máximo de los productos seleccionados
    const selectedproductos = this.productos.filter(product => product.cantidad > 0);
    if (selectedproductos.length === 0) {
      return 0; // Si no hay productos seleccionados, el tiempo es 0
    }

    return this.tiempoTotal = Math.max(...selectedproductos.map(product => product.tiempo));
  }

  showOrderSummary() {

    const selectedproductos = this.productos.filter(product => product.cantidad > 0);
    if (selectedproductos.length === 0) {
      return; // Si no hay productos seleccionados, el tiempo es 0
    }

    // Obtiene el resumen del pedido con los productos, cantidades y precios
    const orderSummary = this.productos
      .filter(product => product.cantidad > 0)
      .map(product => `${product.cantidad}x ${product.nombre} - ${product.precioTotalProducto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`)
      .join('<br>');
  
    // Muestra el resumen del pedido en un SweetAlert
    Swal.fire({
      title: 'Resumen del Pedido',
      html: `
        <p>${orderSummary}</p>
        <p><strong>Total:</strong> ${this.getTotalPrice().toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</p>
        <p><strong>Tiempo estimado:</strong> ${this.getTotalTime()} minutos</p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Hacer pedido',
      cancelButtonText: 'Volver',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    }).then((result: { isConfirmed: any; }) => {
      if (result.isConfirmed) {

        try {
          this.submitOrder();

          Swal.fire(
            {
            title: 'Pedido confirmado', 
            html: 'Tu pedido ha sido confirmado.', 
            icon: 'success',
            didOpen: () => {
              document.documentElement.classList.remove('swal2-height-auto');
              document.body.classList.remove('swal2-height-auto');   
            }
          });
        }

        catch {
          Swal.fire(
            {
            title: 'Error al hacer el pedido', 
            html: 'Intenta nuevamente', 
            icon: 'error',
            didOpen: () => {
              document.documentElement.classList.remove('swal2-height-auto');
              document.body.classList.remove('swal2-height-auto');   
            }
          });
        }
        // Lógica para confirmar el pedido (por ejemplo, enviar a la base de datos)
        
      }
    });
  }
  
  cancelOrder() {
    // Restablece la cantidad y el precio total de cada producto
    this.productos.forEach(product => {
      product.cantidad = 0;
      product.precioTotalProducto = 0;
      this.precioTotal = 0;
      product.expanded = false;
    });
    alert('Pedido cancelado');
  }

  submitOrder() {

    console.log(this.userID);

    let productosFiltrados = this.productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precioUnitario: p.precio,
      precioTotal: p.precioTotalProducto,
      cantidad: p.cantidad,
      sector: p.sector
    }));

    const pedido = {
      userID: this.userID,
      precio: this.precioTotal,
      tiempo: this.tiempoTotal,
      cocina : {
        estado: "pendiente",
        productos: productosFiltrados.filter(p => p.sector === "cocina")
      },
      bar: {
        estado: "pendiente",
        productos: productosFiltrados.filter(p => p.sector === "bar")
      }
    }

    this.firestoreService.createDocument("listaPedidos", pedido)
  }
  
}