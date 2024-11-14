import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { SpinnerComponent } from 'src/app/componentes/spinner/spinner.component';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import Swal from 'sweetalert2';
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
  idPedido: string = '';
  pedido: any;

  constructor(private userService: UserService, public router: Router, private firestoreService: FirestoreService, private route: ActivatedRoute,
              private pushN: PushNotificationsService
  ) { 
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.idPedido = this.route.snapshot.paramMap.get('idPedido') || '';
    console.log("ID del Pedido recibido:", this.idPedido);
    addIcons({ logOutOutline });
  }

  abrirChat() {
    this.router.navigate(['/chat-mozo']);
  }
  
  escanearQR() {
    return this.scanner.startScan();
  }

  async onScanResult(result: string) {
    const pedido: any = await this.firestoreService.getPedidoByUid(this.idPedido);
    let mensaje = '';
    let titulo = '';

    console.log('Pedido:', pedido);
    console.log('Estado:', pedido.estado);

    this.pedido = pedido;
    this.estadoPedido = pedido.estado;

    console.log(this.pedido);
    console.log(this.estadoPedido);

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
        this.firestoreService.updateDocument(`listaPedidos/${this.idPedido}`, { estado: 'recibido' });
        break;

      case 'recibido':
        titulo = 'Ingrese la propina';
        mensaje = 'Se abrirá la cámara para escanear el código QR de la propina.';
        this.pushN.sendNotificationToRole('Han pedido la cuenta!', `La mesa ${this.pedido.mesa} ha solicitado la cuenta.`, 'mozo');
        break;
    }

    Swal.fire({
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
  

























  //--------------------------------------------------------------------------------------------------------------------------------------------------
  // Funcion para realizar la encuesta de satisfaccion del cliente
  async realizarEncuestaCliente() {
    const userId = await this.userService.getId();
    const encuesta = await this.firestoreService.getEncuestaPorUser(userId!);

    if(encuesta) {
      Swal.fire({
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


    Swal.fire({
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

        Swal.fire({
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

    Swal.fire({
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
    Swal.fire({
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
