import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { SpinnerComponent } from 'src/app/componentes/spinner/spinner.component';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Chart } from 'chart.js';
import { Scanner } from 'src/app/componentes/qr-scanner/qr-scanner.component';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';

@Component({
  selector: 'app-menu-cliente-esperando',
  templateUrl: './menu-cliente-esperando.page.html',
  styleUrls: ['./menu-cliente-esperando.page.scss'],
  standalone: true,
  imports: [Scanner, MatIconModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, SpinnerComponent, IonIcon, IonButton ]
})
export class MenuClienteEsperandoPage implements OnInit {
  @ViewChild(Scanner) scanner!: Scanner;
  estadoPedido = 'pendiente';
  pedido: any;
  userID: any;
  cuenta: boolean = false;
  recibido: boolean = false;

  constructor(private userService: UserService, public router: Router, private firestoreService: FirestoreService, private route: ActivatedRoute,
              private pushN: PushNotificationsService
  ) { 
    addIcons({ logOutOutline });
  }

  async ngOnInit() {
    this.userID = await this.userService.getId();
    console.log(this.userID);

    this.pedido = await this.firestoreService.getPedidoPorUserID(this.userID);
    this.estadoPedido = this.pedido?.estado ? this.pedido.estado : "pendiente";
    console.log('Pedido:', this.pedido);
    console.log('Estado:', this.pedido.estado);
    console.log('Mesa:', this.pedido.mesa);

    addIcons({ logOutOutline });
  }

  abrirChat() {
    this.router.navigate(['/chat-mozo']);
  }
  
  escanearQR() {
    return this.scanner.startScan();
  }


  // Manejo del resultado del escaneo
  async onScanResult(result: string) {
    
    console.log("aca en onScanResult")

    this.pedido = await this.firestoreService.getPedidoPorUserID(this.userID);
    this.estadoPedido = this.pedido?.estado ? this.pedido.estado : "pendiente";
    
    console.log('Resultado del escaneo:', result);

    if (this.estadoPedido == "recibido" && result.startsWith("propina")) {
      this.registrarPropina(result);
    } else if (result.startsWith("mesa")) {
      console.log('result', result);
      this.actualizarEstadoPedido(result);
    }
    else {

      sweetAlertConfig.fire({
        title: "Error",
        text: "El QR que escaneaste no es válido",
        icon: 'error',
        confirmButtonText: 'Aceptar',
        backdrop: `rgba(0,0,0,0.8)`,
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');   
        }
      })

    }
  }


  async registrarPropina(propina: string){
    switch (propina) {
      case 'propina_malo':
        this.pedido.porcentajePropina = 0;
        break;
      case 'mesa_regular':
        this.pedido.porcentajePropina = 0.05;
        break;
      case 'propina_bueno':
        this.pedido.porcentajePropina = 0.10;
        break;
      case 'propina_muy_bueno':
        this.pedido.porcentajePropina = 0.15;
        break;
      case 'propina_excelente':
        this.pedido.porcentajePropina = 0.20;
        break;
    }

    this.pedido.propina = this.pedido.precio * this.pedido.porcentajePropina

    try {
      this.firestoreService.updateDocument(`listaPedidos/${this.pedido.id}`, 
        { propina: this.pedido.propina});

        sweetAlertConfig.fire({
          title: "Gracias",
          text: "Sabor académico te agradece por la valoración",
          icon: 'success',
          confirmButtonText: 'PAGAR',
          backdrop: `rgba(0,0,0,0.8)`,
          didOpen: () => {
            document.documentElement.classList.remove('swal2-height-auto');
            document.body.classList.remove('swal2-height-auto');
          }
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("vamor a pagar")
            // Aquí llamamos a la función si se presionó "Aceptar"
            this.simulacionPago();
        }})
      }
    

    catch {

      sweetAlertConfig.fire({
        title: "Ocurrió un probema",
        text: "No se pudo guardar tu propina",
        icon: 'error',
        confirmButtonText: 'PAGAR',
        backdrop: `rgba(0,0,0,0.8)`,
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');
        }
      })
    }
      
  }


  async simulacionPago() {
    // Pedido para debugear
    // this.pedido = await this.firestoreService.getPedidoPorUserID('1jqyeXYCmWfc7et0Ab8nCpoOsuX2');

    const allProducts = [
      ...this.pedido.cocina.productos,
      ...this.pedido.bar.productos,
    ]
      .map(
        p => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${p.nombre}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${p.cantidad}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">$${p.precioTotal}</td>
        </tr>`
      )
      .join('');

    const htmlContent = `
      <div style="text-align: left; font-size: 16px;">
        <p><strong style="font-size: 21px; margin-top: 20px;">Mesa ${this.pedido.mesa}</strong></p>

        <p><strong style="font-size: 21px; margin-top: 20px;">Productos</strong></p>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Producto</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${allProducts}
          </tbody>
        </table>

        
        <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 16px;">Subtotal</div>
          <div style="font-size: 16px; font-weight: bold;">$${this.pedido.precio}</div>
        </div>
        <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 16px;">Propina</div>
          <div style="font-size: 16px; font-weight: bold;">$${this.pedido.propina}</div>
        </div>
        <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 24px; font-weight: bold;">Total</div>
          <div style="font-size: 24px; font-weight: bold;">$${this.pedido.precio + this.pedido.propina}</div>
        </div>
      </div>
    `;

    sweetAlertConfig.fire({
      title: 'Detalle de la Cuenta',
      html: htmlContent,
      icon: 'info',
      confirmButtonColor: '#003049',
      confirmButtonText: 'Pagar',
      showCancelButton: true,
      cancelButtonColor: '#D62828',
      cancelButtonText: 'Cancelar',
      width: '600px',
      customClass: {
        popup: 'swal-wide',
      },
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarOpcionesPago();
      }
    });
  }


  mostrarOpcionesPago() {
    sweetAlertConfig.fire({
      title: 'Elige un método de pago',
      html: `
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          <button id="cash" style="padding: 15px; width: 100%; height: 130px; font-size: 20px; background-color: #545454; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: center;">
            En efectivo
            <br />
            <img src="assets/icon/cash.png" alt="Efectivo" style="margin-top: 5px; width: 45px; height: 40px;">
          </button>
          <button id="card" style="padding: 15px; width: 100%; height: 130px; font-size: 20px; background-color: #545454; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: center;">
            Con tarjeta
            <br />
            <img src="assets/icon/card.png" alt="Tarjeta" style="margin-top: 5px; width: 45px; height: 40px;">
          </button>
          <button id="mp" style="padding: 15px; width: 100%; height: 130px; font-size: 20px; background-color: #545454; color: white; border: none; border-radius: 5px; cursor: pointer; text-align: center;">
            Con Mercado Pago
            <br />
            <img src="assets/icon/mp.png" alt="Mercado Pago" style="margin-top: 5px; width: 120px; height: 40px;">
          </button>
        </div>
      `,
      showConfirmButton: false,
      width: '90%',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      },
      didRender: () => {
        document.getElementById('cash')?.addEventListener('click', () => {
          this.mostrarPagoExitoso();
        });
        document.getElementById('card')?.addEventListener('click', () => {
          this.mostrarPagoExitoso();
        });
        document.getElementById('mp')?.addEventListener('click', () => {
          this.mostrarPagoExitoso();
        });
      },
    });
  }

  mostrarPagoExitoso() {
    sweetAlertConfig.fire({
      title: '¡Pago realizado con éxito!',
      text: 'Gracias por elegirnos. ¡Esperamos verte pronto!',
      icon: 'success',
      confirmButtonText: '¡Nos vemos!',
      confirmButtonColor: '#4caf50',
      backdrop: true,
      width: '90%',
      padding: '10px',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      },
      didClose: () => {
        this.firestoreService.updateDocument(`listaPedidos/${this.pedido.id}`, { estado: 'pagado' })
          .then(() => {
            this.router.navigate(['/ingreso-mesa']);
          });
      }
    });
  }

  async actualizarEstadoPedido(tableNumber: string) {

    console.log("aca en actualizar estado pedido")
    console.log(tableNumber)

    switch (tableNumber) {
      case 'mesa_uno':
        tableNumber = '1';
        break;
      case 'mesa_dos':
        tableNumber = '2';
        break;
      case 'mesa_tres':
        tableNumber = '3';
        break;
      case 'mesa_cuatro':
        tableNumber = '4';
        break;
      case 'mesa_cinco':
        tableNumber = '5';
        break;
      case 'mesa_seis':
        tableNumber = '6';
        break;
      case 'mesa_siete':
        tableNumber = '7';
        break;
    }

    console.log(tableNumber)
    console.log(this.pedido.mesa)


    if(tableNumber !== this.pedido.mesa){
      sweetAlertConfig.fire({
        title: "No permitido",
        text: "Este no es el QR de tu mesa. Tu mesa es la numero: " + this.pedido.mesa,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        backdrop: `rgba(0,0,0,0.8)`,
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');   
        }
      })
    }

    else {

      let mensaje = '';
      let titulo = '';
  
      switch(this.estadoPedido) {
        case 'pendiente':
          titulo = 'Pedido pendiente';
          mensaje = 'Tu pedido está pendiente de preparación.';
          break;
  
        case 'derivado':
          titulo = 'En preparacion';
          mensaje = 'Estamos preparando tu pedido.';
          break;
  
        case 'listo para servir':
          titulo = 'Listo para servir';
          mensaje = 'Tu pedido está listo para ser servido.';
          this.estadoPedido = 'recibido';
          this.firestoreService.updateDocument(`listaPedidos/${this.pedido.id}`, { estado: 'recibido' });
          break;
  
        case 'recibido':
          {
            
            if(!this.recibido){
              titulo = 'Pedido recibido';
              mensaje = '¡Esperamos que disfrutes tu pedido!';
              this.recibido = true;
              break;
            }
  
            else {
              this.cuenta = true;
              titulo = 'Ingrese la propina';
              mensaje = 'Se abrirá la cámara para escanear el código QR de la propina.';
              this.scanner.stopScan();
              this.pushN.sendNotificationToRole('Han pedido la cuenta!', `La mesa ${this.pedido.mesa} ha solicitado la cuenta.`, 'mozo');
              break;
            }
          }
      }
  
      if(this.estadoPedido == "recibido" && this.cuenta){

        console.log("aca en este sweet alertsssss")
  
       sweetAlertConfig.fire({
            title: titulo,
            text: mensaje,
            icon: 'info',
            confirmButtonText: 'Aceptar',
            backdrop: `rgba(0,0,0,0.8)`,
            didOpen: () => {
              document.documentElement.classList.remove('swal2-height-auto');
              document.body.classList.remove('swal2-height-auto');
            }
          }).then((result) => {
            if (result.isConfirmed) {
              console.log("aceptamos qr de propina")
              // Aquí llamamos a la función si se presionó "Aceptar"
              this.escanearQR();
          }})
      }
      else { 
        sweetAlertConfig.fire({
          title: titulo,
          text: mensaje,
          icon: 'info',
          confirmButtonText: 'Aceptar',
          backdrop: `rgba(0,0,0,0.8)`,
          didOpen: () => {
            document.documentElement.classList.remove('swal2-height-auto');
            document.body.classList.remove('swal2-height-auto');
          }
        })
      }
  

    }


   
  }
  

























  //--------------------------------------------------------------------------------------------------------------------------------------------------
  // Funcion para realizar la encuesta de satisfaccion del cliente
  async realizarEncuestaCliente() {
    const userId = await this.userService.getId();
    const encuesta = await this.firestoreService.getEncuestaPorUser(userId!);

    if(encuesta) {
      sweetAlertConfig.fire({
        title: 'Encuesta ya realizada',
        text: 'Ya has realizado la encuesta de satisfacción.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');
        }
      });
      return;
    }


    sweetAlertConfig.fire({
      title: '<strong>Encuesta de Satisfacción</strong>',
      width: '90%',
      padding: '1em',
      customClass: {
        popup: 'no-scroll',
      },
      html: `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
          <label>Calificación (1-10):</label>
          <input id="calificacion" type="range" min="1" max="10" value="5" class="swal2-input" style="margin: 0; width: 100%;">

          <label>Comentario:</label>
          <input id="comentario" type="text" class="swal2-input" style="margin: 0; width: 100%;">

          <label>¿Cómo fue la atención del mozo?</label>
          <div style="margin-bottom: 1em; font-size: 14px;">
            <input type="radio" name="atencionMozo" value="muy buena" style="margin-right: 5px;"> Muy buena<br>
            <input type="radio" name="atencionMozo" value="buena" style="margin-right: 5px;"> Buena<br>
            <input type="radio" name="atencionMozo" value="normal" style="margin-right: 5px;"> Normal<br>
            <input type="radio" name="atencionMozo" value="mala" style="margin-right: 5px;"> Mala<br>
          </div>

          <label>Aspectos en buena condición:</label>
          <div style="margin-bottom: 1em; font-size: 14px;">
            <input type="checkbox" id="iluminacion" value="Iluminación" style="margin-right: 5px;"> Iluminación<br>
            <input type="checkbox" id="ventilacion" value="Ventilación" style="margin-right: 5px;"> Ventilación<br>
            <input type="checkbox" id="ambiente" value="Ambiente" style="margin-right: 5px;"> Ambiente<br>
            <input type="checkbox" id="ruido" value="Ruido" style="margin-right: 5px;"> Ruido<br>
          </div>

          <label>¿Recomendarías el restaurant?</label>
          <select id="recomendacion" class="swal2-input" style="margin: 0; width: 100%; font-size: 14px;">
            <option value="si">Sí</option>
            <option value="no">No</option>
            <option value="tal vez">Tal vez</option>
          </select>

          <label>Fotos (opcional):</label>
          <input type="file" id="fotos" accept="image/*" multiple class="swal2-input" style="margin: 0; width: 100%; font-size: 14px; padding: 6px; border-radius: 5px; display: inline-block;">
          <small style="color: #888;">Máximo 3 fotos</small>
        </div>
      `,
      focusConfirm: false,
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      },
      preConfirm: () => {
        const calificacion = (document.getElementById('calificacion') as HTMLInputElement).value;
        const comentario = (document.getElementById('comentario') as HTMLInputElement).value;

        // Obtener el valor de la atención del mozo seleccionada en radio button
        const atencionMozo = (document.querySelector('input[name="atencionMozo"]:checked') as HTMLInputElement)?.value;

        // Obtener valores seleccionados de los checkboxes
        const aspectosCondicion = [
          (document.getElementById('iluminacion') as HTMLInputElement).checked ? 'Iluminación' : '',
          (document.getElementById('ventilacion') as HTMLInputElement).checked ? 'Ventilación' : '',
          (document.getElementById('ambiente') as HTMLInputElement).checked ? 'Ambiente' : '',
          (document.getElementById('ruido') as HTMLInputElement).checked ? 'Ruido' : '',
        ].filter(Boolean);

        const recomendacion = (document.getElementById('recomendacion') as HTMLSelectElement).value;

        return { calificacion, comentario, atencionMozo, aspectosCondicion, recomendacion };
      },
      confirmButtonText: 'Enviar Encuesta',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const encuestaData = result.value;
        
        console.log(encuestaData);
        this.firestoreService.createDocument('encuestas', {...encuestaData, userID: userId});

        sweetAlertConfig.fire({
          title: '¡Gracias por tu tiempo!',
          text: 'La encuesta fue enviada con éxito.',
          icon: 'success',
          didOpen: () => {
            document.documentElement.classList.remove('swal2-height-auto');
            document.body.classList.remove('swal2-height-auto');
          }
        });
      }
    });
  }


  // Funcion para abrir el modal con los resultados de las encuestas a clientes
  async mostrarEncuestasCliente() {
    const encuestas = await this.firestoreService.getEncuestas();
  
    const calificaciones: number[] = [];
    const atencionMozo: string[] = [];
    const aspectosCondicion: any = {
      iluminacion: 0,
      ventilacion: 0,
      ambiente: 0,
      ruido: 0,
    };
    const recomendacion: string[] = [];

    encuestas.forEach(encuesta => {
      calificaciones.push(encuesta.calificacion);
      atencionMozo.push(encuesta.atencionMozo);
      encuesta.aspectosCondicion.forEach((aspecto: any) => {
        if (aspecto === 'Iluminación') aspectosCondicion.iluminacion++;
        if (aspecto === 'Ventilación') aspectosCondicion.ventilacion++;
        if (aspecto === 'Ambiente') aspectosCondicion.ambiente++;
        if (aspecto === 'Ruido') aspectosCondicion.ruido++;
      });
      recomendacion.push(encuesta.recomendacion);
    });

    sweetAlertConfig.fire({
      title: 'Resultados de las Encuestas',
      width: '90%',
      html: `
        <div class="modal-content">
          <div class="chart-container">
            <canvas id="calificacionChart" width="400" height="200"></canvas>
            <canvas id="atencionMozoChart" width="400" height="200"></canvas>
            <canvas id="aspectosCondicionChart" width="400" height="200"></canvas>
            <canvas id="recomendacionChart" width="400" height="200"></canvas>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: 'Cerrar',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');
        const modalContent = document.querySelector('.swal2-html-container') as HTMLElement;
        modalContent.style.overflowY = 'auto';
        modalContent.style.maxHeight = '570px';
  
        
        setTimeout(() => {
          new Chart('calificacionChart', {
            type: 'bar',
            data: {
              labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
              datasets: [{
                label: 'Calificación Promedio',
                data: Array.from({ length: 10 }, (_, i) => calificaciones.filter(c => Number(c) === i + 1).length), // Convierte 'c' a número
                backgroundColor: '#4caf50',
                borderColor: '#388e3c',
                borderWidth: 1,
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: { ticks: { autoSkip: false } },
              },
            }
          });
  
          new Chart('atencionMozoChart', {
            type: 'pie',
            data: {
              labels: ['Muy buena', 'Buena', 'Normal', 'Mala'],
              datasets: [{
                data: [
                  atencionMozo.filter(a => a === 'muy buena').length,
                  atencionMozo.filter(a => a === 'buena').length,
                  atencionMozo.filter(a => a === 'normal').length,
                  atencionMozo.filter(a => a === 'mala').length,
                ],
                backgroundColor: ['#8bc34a', '#cddc39', '#ffeb3b', '#f44336'],
                borderColor: '#ffffff',
                borderWidth: 2,
              }]
            },
            options: {
              responsive: true,
            }
          });
  
          new Chart('aspectosCondicionChart', {
            type: 'bar',
            data: {
              labels: ['Iluminación', 'Ventilación', 'Ambiente', 'Ruido'],
              datasets: [{
                label: 'Aspectos en buena condición',
                data: [aspectosCondicion.iluminacion, aspectosCondicion.ventilacion, aspectosCondicion.ambiente, aspectosCondicion.ruido],
                backgroundColor: '#3f51b5',
                borderColor: '#303f9f',
                borderWidth: 1,
              }]
            },
            options: {
              responsive: true,
            }
          });
  
          new Chart('recomendacionChart', {
            type: 'pie',
            data: {
              labels: ['Sí', 'No', 'Tal vez'],
              datasets: [{
                data: [
                  recomendacion.filter(r => r === 'si').length,
                  recomendacion.filter(r => r === 'no').length,
                  recomendacion.filter(r => r === 'tal vez').length,
                ],
                backgroundColor: ['#2196f3', '#f44336', '#ff9800'],
                borderColor: '#ffffff',
                borderWidth: 2,
              }]
            },
            options: {
              responsive: true,
            }
          });
        }, 500);
      }
    });
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
