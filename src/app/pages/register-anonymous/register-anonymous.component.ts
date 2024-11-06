import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, FormBuilder } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
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

  constructor(private fb: FormBuilder,protected authService: AuthService, private router: Router, private firestoreService: FirestoreService) {
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
      console.log("Formulario no válido");
    }
  }
  
  navigateRegister(){
    this.router.navigate(['/register'])
  }
  async crearCliente() {
    const cliente = {
      nombre: this.miformulario.get('nombre')?.value,
      tipoCliente: "anonimo",
      estadoCliente: "no necesita",
      rol: "cliente",
      fotoUrl: ''
  };
    try {
       await this.firestoreService.createDocument(`usuarios`, cliente );
      //await this.authService.createUser(cliente,this.miformulario.get('correo')?.value, this.miformulario.get('contrasena')?.value);
    } catch (error) {
      console.error('Error durante la creación del cliente:', error);
    }
  }
  
  ngOnInit() {
  }
}
