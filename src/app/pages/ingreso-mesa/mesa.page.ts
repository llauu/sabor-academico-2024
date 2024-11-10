import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Scanner } from 'src/app/componentes/qr-scanner/qr-scanner.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UserService } from 'src/app/services/user.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
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
  isScanAllowed: boolean = false; // La condición booleana para permitir el escaneo
  userUID: any;
  action : string = ""
  ingreso: boolean = true;
  mesa:boolean = false;
  userFullName: any;


  constructor(private firestoreService: FirestoreService, private userService: UserService, public router: Router, private pushNotification: PushNotificationsService) {
    addIcons({ logOutOutline });
  }


  async ngOnInit() {
    try {
      this.userUID = await this.userService.getUid();
      this.userFullName= await this.userService.getName();
      console.log(this.userUID);
      console.log(this.userFullName);

    } catch (error) {
      console.error('Error al obtener UID:', error);
    }
  }


  
  // Método para verificar la condición y abrir el escáner
  async tryOpenScanner(action: string) {

    this.action = action;
    console.log(action)

    let title = "";
    let message = ""

    const waiting = await this.buscarPorUserUID('listaEspera', 'userUID');
    const table = await this.buscarPorUserUID('listaMesas', 'userUID');

    if ((action === "ingreso" && !waiting[0]) || 
        (action === "mesa" && waiting[0]?.state === "accepted" && table[0]?.number)) {
          console.log("aca");
          this.isScanAllowed = true;
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


    if (this.isScanAllowed) {
      console.log(`Escaneo permitido para acción: ${action}`);
      this.scanner.startScan();
    } else {
      console.log(message)
      console.log(`Escaneo NO permitido para acción: ${action}`);


      Swal.fire({
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
  }

  // // Cambia la condición para permitir el escaneo (esto es solo un ejemplo)
  // toggleScanPermission() {
  //   this.isScanAllowed = !this.isScanAllowed;
  // }

  // Manejo del resultado del escaneo
  onScanResult(result: string) {

    console.log('Resultado del escaneo:', result);

    if (result === "ingreso") {
      this.registerUser();
    } else if (result.startsWith("mesa")) {
      this.requestTable(result);
    }
    else {

      Swal.fire({
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

    this.isScanAllowed = false

  }



  async registerUser() {
    const newRegister = 
    { 
      userUID: this.userUID, 
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


    Swal.fire({
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

    let title = ""
    let message = ""

    try {
      const table = await this.buscarPorUserUID('listaMesas',"userUID");

      console.log(table[0]?.number)

      if (tableNumber === table[0]?.number) {
        title = "¡Bienvenido!"
        message = "Dirigite a la mesa numero: " + table[0]?.number;
      } else {
        title = "Error"
        message = "Tu mesa es la numero: " + table[0]?.number;
      }
    } catch (error) {
      console.error('Error al buscar el usuario en las mesas:', error);
      message = "Ocurrió un error. Intentá en unos segundos";
    }


    Swal.fire({
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

  async buscarPorUserUID(collection: string, field: string): Promise<any> {

    if (!this.userUID) {
      console.error("User UID is undefined");
      return [];
    }

    try {
      const documents = await this.firestoreService.getDocumentsByField<any>(collection, field, this.userUID);
      return documents;
    } catch (error) {
      console.error(`Error al obtener documentos de la colección ${collection} con UID: ${this.userUID}`, error);
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




  // Funcion para realizar la encuesta de satisfaccion del cliente
  realizarEncuestaCliente() {
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
        this.firestoreService.createDocument('encuestas', encuestaData);

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
