import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, FormBuilder } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { FcmService } from 'src/app/services/fcm.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Component({
  selector: 'app-register-anonymous',
  templateUrl: './register-anonymous.component.html',
  styleUrls: ['./register-anonymous.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, CommonModule, FormsModule]
})
export class RegisterAnonymousComponent implements OnInit {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  contrasena: string = '';
  dni: string = '';
  correo: string = '';
  
  miformulario: FormGroup;

  constructor(private fb: FormBuilder,protected authService: AuthService, private router: Router, private firestoreService: FirestoreService, private fcm: FcmService) {
    this.miformulario = this.fb.group({
      nombre: ['', Validators.required],
    }, );
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.miformulario.valid) {
      this.crearCliente();
      console.log("Formulario enviado", this.miformulario.value);
    } else {
      this.alertaError();
      console.log("Formulario no válido");
    }
  }
  alertaError(){
    sweetAlertConfig.fire({
      title: 'Error al crear cliente',
      text: '¡Revise datos ingresados!',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      backdrop: `rgba(0,0,0,0.8)`,
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    });    
  }
  navigateRegister(){
    this.router.navigate(['/register'])
  }

  async sacarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      promptLabelHeader: "FOTO DE PERFIL",
      promptLabelPicture: "TOMAR FOTO",
      promptLabelPhoto: "DESDE GALERÍA"
    });}

  async crearCliente() {
    const cliente = {
      nombre: this.miformulario.get('nombre')?.value,
      tipoCliente: "anonimo",
      estadoCliente: "no necesita",
      rol: "cliente",
      fotoUrl: ''
  };
    try {
      const uid = await this.firestoreService.createDocument(`usuarios`, cliente );

      // Inicializamos push notifications
      this.fcm.init(uid);

      sweetAlertConfig.fire({
        title: 'Cliente creado',
        text: '¡Ya puede disfrutar de nuestros servicios anónimamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        backdrop: `rgba(0,0,0,0.8)`,
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');
        }
      });
      this.router.navigate(['/ingreso-mesa'])
    } catch (error) {
      console.error('Error durante la creación del cliente:', error);
    }
  }
  
  ngOnInit() {
  }
}
