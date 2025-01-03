import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { IonicModule } from '@ionic/angular';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';

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
  productosCocina: any[] = []
  productosBar: any[] = []
  userID: any;
  userFullName: string | null = '';
  precioTotal: number = 0;
  tiempoTotal: number = 0;
  mesa: any
  selectedSection: string = 'cocina'; // Sección activa por defecto


  constructor(private firestoreService: FirestoreService, private userService: UserService, private router: Router, private pushN: PushNotificationsService) {}

  async ngOnInit() {
    this.userID = await this.userService.getId();
    this.userFullName = await this.userService.getName();
    this.mesa = await this.firestoreService.getMesaPorUserID(this.userID);
    this.productos = await this.firestoreService.getProductos();
    this.productosBar = this.productos.filter(producto => producto.sector === 'bar');
    this.productosCocina = this.productos.filter(producto => producto.sector === 'cocina');

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
    sweetAlertConfig.fire({
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

          sweetAlertConfig.fire(
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
          sweetAlertConfig.fire(
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
    sweetAlertConfig.fire({
      title: '¿Estas seguro que querés cancelar el pedido?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Cancelar',
      cancelButtonText: 'Volver',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    }).then((result: { isConfirmed: any; }) => {

      if(result.isConfirmed){
        this.productos.forEach(product => {
          product.cantidad = 0;
          product.precioTotalProducto = 0;
          this.precioTotal = 0;
          product.expanded = false;
        });

        this.router.navigate(['menu-cliente'])
      }
      
    })
  }

  async submitOrder() {
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
      estado: "pendiente",
      cocina : {
        estado: "pendiente",
        productos: productosFiltrados.filter(p => p.sector === "cocina" && p.cantidad > 0)
      },
      bar: {
        estado: "pendiente",
        productos: productosFiltrados.filter(p => p.sector === "bar" && p.cantidad > 0)
      },
      mesa: this.mesa.number
    }

    try {
      const idPedido = await this.firestoreService.createDocument("listaPedidos", pedido);
      this.pushN.sendNotificationToRole("Nuevo pedido!", "Hay un nuevo pedido esperando tu confirmación.", "mozo");
  
      this.router.navigate(['/menu-cliente-esperando', { idPedido }]);
    } catch (error) {
      console.error("Error al crear el pedido:", error);
    }
  }

  confirmLogout() {
    sweetAlertConfig.fire({
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