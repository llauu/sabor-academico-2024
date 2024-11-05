import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, FormBuilder } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  password: string = '';
  dni: string = '';
  correo: string = '';
  
  miformulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.miformulario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],  // Valida un DNI con 7 u 8 dígitos
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(8)]],
    }, );
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.miformulario.valid) {
      console.log("Formulario enviado", this.miformulario.value);
    } else {
      console.log("Formulario no válido");
    }
  }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister() {
    // Implement your registration logic here
    console.log('Registration submitted');
  }
}
