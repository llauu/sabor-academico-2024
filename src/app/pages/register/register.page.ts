import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, FormBuilder } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Scanner } from 'src/app/componentes/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, CommonModule, FormsModule, Scanner]
})


export class RegisterPage implements OnInit {
  // Referencia al componente Scanner
  @ViewChild(Scanner) scanner!: Scanner;

  miformulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    protected authService: AuthService,
    private router: Router
  ) {
    // Inicializamos el formulario reactivo
    this.miformulario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // Método que se ejecuta cuando se recibe el resultado del escaneo QR
  onScanResult(data: string) {
    
    this.fillFormWithScannedData(data);
  }

  // Llena los campos del formulario con los datos del QR
  fillFormWithScannedData(data: string) {

    try {

      const extractedData = data.split('@');

      if (extractedData.length >= 8) {
        this.miformulario.get('nombre')?.setValue(extractedData[2]);
        this.miformulario.get('apellido')?.setValue(extractedData[1]);
        this.miformulario.get('dni')?.setValue(extractedData[4]);
      } else {
        console.error('Formato de datos escaneados incorrecto');
      }
    } catch (error) {
      console.error('El QR no contiene datos válidos', error);
    }
  }

  // Método para navegar a la página de inicio de sesión
  navigateHome() {
    this.router.navigate(['/login']);
  }

  // Método para navegar a la página anónima
  navigateAn() {
    this.router.navigate(['/anonymous']);
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

  // Crea un nuevo cliente con los datos del formulario
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
      });
      this.navigateHome();
    } catch (error) {
      this.alertaError();
      console.error('Error durante la creación del cliente:', error);
    }
  }

  // Alerta de error en caso de datos incorrectos
  alertaError() {
    Swal.fire({
      title: 'Error al crear cliente',
      text: '¡Revise datos ingresados!',
      icon: 'error',
      confirmButtonText: 'Aceptar',
      backdrop: `rgba(0,0,0,0.8)`,
    });
  }

  ngOnInit() {}
}

