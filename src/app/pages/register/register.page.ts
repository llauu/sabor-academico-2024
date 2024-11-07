import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, FormBuilder } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SpinnerComponent } from '../../componentes/spinner/spinner.component';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, IonButton, SpinnerComponent]
})
export class RegisterPage implements OnInit {
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  contrasena: string = '';
  dni: string = '';
  correo: string = '';
  
  miformulario: FormGroup;

  constructor(private fb: FormBuilder,protected authService: AuthService, private router: Router) {
    this.miformulario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
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
  
  navigateHome(){
    this.router.navigate(['/login'])
  }
  navigateAn(){
    this.router.navigate(['/anonymous'])
  }
  async crearCliente() {
    const cliente = {
      nombre: this.miformulario.get('nombre')?.value,
      apellido: this.miformulario.get('apellido')?.value,
      dni: this.miformulario.get('dni')?.value,
      correo: this.miformulario.get('correo')?.value,
      contrasena: this.miformulario.get('contrasena')?.value,
      tipoCliente: "registrado",
      estadoCliente: "pendiente",
      rol: "cliente",
      fotoUrl: ''
  };
    try {
      await this.authService.createUser(cliente, this.miformulario.get('correo')?.value, this.miformulario.get('contrasena')?.value);
      Swal.fire({
        title: 'Cliente creado',
        text: '¡Revise su casilla de correo!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        backdrop: `rgba(0,0,0,0.8)`,
        didOpen: () => {
          document.documentElement.classList.remove('swal2-height-auto');
          document.body.classList.remove('swal2-height-auto');
        }
      });
      this.navigateHome();
    } catch (error) {
      this.alertaError();
      console.error('Error durante la creación del cliente:', error);
    }
  }
  alertaError(){
    Swal.fire({
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
  ngOnInit() {
  }
}
