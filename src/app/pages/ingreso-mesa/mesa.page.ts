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
