import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Scanner } from 'src/app/componentes/qr-scanner/qr-scanner.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UserService } from 'src/app/services/user.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-mesa',
  templateUrl: 'mesa.page.html',
  styleUrls: ['mesa.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, Scanner, MatIcon, IonButton, CommonModule, IonIcon],
})
export class MesaPage implements OnInit {


  @ViewChild(Scanner) scanner!: Scanner;
 // isScanAllowed: boolean = false; // La condición booleana para permitir el escaneo
  userID: any;
  action : string = ""
  ingreso: boolean = true;
  mesa:boolean = false;
  userFullName: any;
  pedidoExistente : any = null;
  private currentAudio: HTMLAudioElement | null = null;
  loading!: HTMLIonLoadingElement;
  public audioInicioSesion = new Audio('../../../../assets/logOut.mp3');
  public audio = new Audio('../../../../assets/inicioSesion.mp3');

  constructor(private firestoreService: FirestoreService, private userService: UserService, public router: Router, private pushNotification: PushNotificationsService) {
    addIcons({ logOutOutline });
  }


  async ngOnInit() {
    try {
      this.currentAudio = this.audio;
      this.playAudio(this.audio);
      this.userID = await this.userService.getId();
      this.userFullName = await this.userService.getName();
      console.log(this.userID);
      console.log(this.userFullName);

    } catch (error) {
      console.error('Error al obtener ID:', error);
    }
  }


  
  // Método para verificar la condición y abrir el escáner
  async tryOpenScanner(action: string) {

    this.action = action;
    console.log(action)

    let title = "";
    let message = ""

    const waiting = await this.buscarPorUserID('listaEspera');
    const table = await this.buscarPorUserID('listaMesas');
    
    console.log(waiting)
    console.log(table)
    
    if ((action === "ingreso" && !waiting[0]) || 
        (action === "mesa" && waiting[0]?.state === "accepted" && table[0]?.number)) {
          console.log("aca");
          console.log(`Escaneo permitido para acción: ${action}`);
          return this.scanner.startScan();
    } 

    else if (action === "mesa" && !waiting[0]) {
      title = "¡Recordá!"
      message = "Primero tenes que solicitar el ingreso al local";
    } 
    else if (action === "ingreso" && waiting[0] && waiting[0].state === "accepted" && table[0]?.number) {
      title = "¡Ya podes escanear el QR de tu mesa!"
      message = "Te asignamos la mesa numero: " + table[0].number ;
    } 
    else if (waiting[0] && waiting[0].state === "pending") {
      title = "Aguardanos unos minutos";
      message = "Estamos aceptando tu ingreso y te asignaremos una mesa";
    } 
    else if (waiting[0] && waiting[0].state === "accepted") {
      title = "Aguardanos unos minutos"
      message = "Te estamos asignando una mesa";
    }

    console.log(message)
    console.log(`Escaneo NO permitido para acción: ${action}`);

    sweetAlertConfig.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      backdrop: `rgba(0,0,0,0.8)`,
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    })
    
  }

  // // Cambia la condición para permitir el escaneo (esto es solo un ejemplo)
  // toggleScanPermission() {
  //   this.isScanAllowed = !this.isScanAllowed;
  // }

  // Manejo del resultado del escaneo
  onScanResult(result: string) {

    console.log('Resultado del escaneo:', result);

    if (this.action == "ingreso" && result === "ingreso") {
      this.registerUser();
    } else if (this.action == "mesa" && result.startsWith("mesa")) {
      console.log('result', result);
      this.requestTable(result);
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



  async registerUser() {
    const newRegister = 
    { 
      userID: this.userID, 
      userFullName: this.userFullName,
      state: "pending" 
    };

    let title = ""
    let message = ""
    try {
      const idGenerado = await this.firestoreService.createDocument('listaEspera', newRegister);
      console.log('Documento agregado con ID:', idGenerado);
      title = "¡Listo!"
      message = "Ya fuiste agregado a la lista de espera";

      // Enviar notificacion al maitre
      this.pushNotification.sendNotificationToRole("Nuevo ingreso!", "Hay un nuevo cliente esperando para ingresar al local.", "maitre");
    } catch (error) {
      console.error('Error al agregar a la lista de espera:', error);
      title = "Lo sentimos";
      message = "Ocurrió un error al agregarte a la lista. Intentá en unos segundos";
    }


    sweetAlertConfig.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      backdrop: `rgba(0,0,0,0.8)`,
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    })
  }

  async requestTable(tableNumber: string) {
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

    let title = ""
    let message = ""
    let valido = false;

    try {
      const table = await this.buscarPorUserID('listaMesas');

      console.log(table[0]?.number)

      this.pedidoExistente = await this.buscarPorUserID('listaPedidos')

      message = this.pedidoExistente[0] ? "Tu pedido está:" + this.pedidoExistente[0].estado : "Ahora vas a poder hacer el pedido"

      if (tableNumber === table[0]?.number) {
        title = "¡Bienvenido a tu mesa: " + table[0]?.number + '!'
        message = message;
        valido = true;
      } else {
        title = "Error"
        message = "Tu mesa es la numero: " + table[0]?.number;
      }
    } catch (error) {
      console.error('Error al buscar el usuario en las mesas:', error);
      message = "Ocurrió un error. Intentá en unos segundos";
    }

    sweetAlertConfig.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      backdrop: `rgba(0,0,0,0.8)`,
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    }).then((result) => {
      // Si el usuario hace clic en "Aceptar"
      if (result.isConfirmed) {
        if (valido) {

          if(this.pedidoExistente[0])
            this.router.navigate(['/menu-cliente-esperando']);
          else
            this.router.navigate(['/menu-cliente']);

        }
      }
    })
  }

  async buscarPorUserID(collection: string): Promise<any> {

    if (!this.userID) {
      console.error("User ID is undefined");
      return [];
    }

    try {
      const documents = await this.firestoreService.getDocumentsByField<any>(collection, "userID", this.userID);
      return documents;
    } catch (error) {
      console.error(`Error al obtener documentos de la colección ${collection} con ID: ${this.userID}`, error);
      return [];
    }
  }


  goToMesa() {
    this.mesa = true; 
    this.ingreso = false;
  }

  goToIngreso() {
    this.mesa = false; 
    this.ingreso = true;
  }

  reviews() {
    console.log("aca abrimos modal con las reseñas")
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
  
    // ChartJS.register(
    //   CategoryScale,
    //   LinearScale,
    //   Title,
    //   Tooltip,
    //   Legend,
    //   BarElement,   
    //   ArcElement    
    // );
  

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
  playAudio(audio: HTMLAudioElement) {
    audio.load();
    audio.play().catch(err => console.error('Error al reproducir el audio:', err));
  }
  logOut() {
    this.userService.logout()
      .then(() => {
        this.currentAudio = this.audioInicioSesion;
        this.playAudio(this.audioInicioSesion);
        this.router.navigate(['/login']);
      });
  }
}
