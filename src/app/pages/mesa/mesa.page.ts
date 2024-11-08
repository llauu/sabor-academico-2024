import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Scanner } from 'src/app/componentes/qr-scanner/qr-scanner.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UserService } from 'src/app/services/user.service';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-mesa',
  templateUrl: 'mesa.page.html',
  styleUrls: ['mesa.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, Scanner, MatIcon, IonButton],
})
export class MesaPage implements OnInit {


  @ViewChild(Scanner) scanner!: Scanner;
  isScanAllowed: boolean = true; // La condición booleana para permitir el escaneo
  texto: string = '';
  userUID: any;
  action : string = ""


  constructor(private firestoreService: FirestoreService, private userService: UserService) {}


  async ngOnInit() {
    try {
      this.userUID = await this.userService.getUid();
      const waiting = await this.buscarPorUserUID('listaEspera', 'userUID');
      const table = await this.buscarPorUserUID('listaMesas', 'userUID');
      console.log(this.userUID);
    } catch (error) {
      console.error('Error al obtener UID:', error);
    }
  }


  
  // Método para verificar la condición y abrir el escáner
  tryOpenScanner(action: string) {

    this.action = action;

    console.log(action)

    this.startScanner(action);

    // if (this.isScanAllowed) {
    //   // console.log(`Escaneo permitido para acción: ${action}`);
    //   // this.scanner.startScan();
    // } else {
    //   console.log(`Escaneo NO permitido para acción: ${action}`);
    //   // Mostrar mensaje al usuario si es necesario
    //   alert("No tienes permiso para escanear en este momento.");
    // }
  }

  // // Cambia la condición para permitir el escaneo (esto es solo un ejemplo)
  // toggleScanPermission() {
  //   this.isScanAllowed = !this.isScanAllowed;
  // }

  // Manejo del resultado del escaneo
  onScanResult(result: string) {
    console.log('Resultado del escaneo:', result);

    if (this.action === "ingreso") {
      this.registerUser(result);
    } else if (this.action === "mesa") {
      this.requestTable(result);
    }

    // const { data, action } = event;
    // if (action === "ingreso") {
    //   this.registerUser(data);
    // } else if (action === "mesa") {
    //   this.requestTable(data);
    // }
    // Aquí puedes manejar el resultado del escaneo como necesites
  }


 
  async startScanner(action: string) {
  
    const waiting = await this.buscarPorUserUID('listaEspera', "userUID");
    const table = await this.buscarPorUserUID('listaMesas', "userUID");

    console.log(waiting)
    console.log(table)
    console.log(action);
    

    if ((action === "ingreso" && !waiting[0]) || 
        (action === "mesa" && waiting[0]?.state === "accepted" && table[0]?.number)) {
          console.log("aca");
          
        this.scanner.startScan();
    } 
    else if (action === "mesa" && !waiting[0]) {
      this.texto = "Primero tenes que solicitar el ingreso al local";
    } 
    else if (action === "ingreso" && waiting[0] && waiting[0].state === "accepted" && table[0]?.number) {
      this.texto = "Te asignamos la mesa numero: " + table[0].number + "  Escanea el QR correspondiente";
    } 
    else if (waiting[0] && waiting[0].state === "pending") {
      this.texto = "Espera unos minutos a que aceptemos tu ingreso y te asignemos una mesa";
    } 
    else if (waiting[0] && waiting[0].state === "accepted") {
      this.texto = "Aguarda unos minutos! Te estamos asignando una mesa";
    }
  }


  async registerUser(data: string) {
    const newRegister = { userUID: this.userUID, state: "pending" };

    try {
      const idGenerado = await this.firestoreService.createDocument('listaEspera', newRegister);
      console.log('Documento agregado con ID:', idGenerado);
      this.texto = "Agregado a la lista de espera";
    } catch (error) {
      console.error('Error al agregar a la lista de espera:', error);
      this.texto = "Ocurrió un error al agregarte a la lista. Intentá en unos segundos";
    }
  }

  async requestTable(tableNumber: string) {
    try {
      const table = await this.buscarPorUserUID('listaMesas',"userUID");

      if (tableNumber !== table[0]?.number) {
        this.texto = "QR inválido o incorrecto";
        return;
      } else {
        this.texto = "¡Bienvenido! Te hemos asignado una mesa en el local";
      }
    } catch (error) {
      console.error('Error al buscar el usuario en las mesas:', error);
      this.texto = "Ocurrió un error. Intentá en unos segundos";
    }
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
}
