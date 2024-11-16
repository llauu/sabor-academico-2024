import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingController , IonButton, IonInput, IonItem, IonLabel, IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonFooter, IonButtons } from '@ionic/angular/standalone';
import { FormsModule, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FirestoreService } from '../../services/firestore.service';
import {SpinnerComponent} from '../../componentes/spinner/spinner.component'
import { sweetAlertConfig } from 'sweet-alert-config';

@Component({
  
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [SpinnerComponent,IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonGrid, IonRow, IonCol, CommonModule, ReactiveFormsModule, FormsModule]
})
export class LoginPage implements OnInit {
  loginForm: any;
  errorMsg: string = '';
  isLoading : boolean = false;

  private currentAudio: HTMLAudioElement | null = null;
  constructor(private firestoreService: FirestoreService, public authService: AuthService, private userService: UserService, private router: Router) { 
    if(this.userService.getLogged()) {
      this.cargarMenuPorRol(this.userService.getRol());
    }
  }

  ngOnInit() {
    this.loginForm = new FormGroup ({
      email: new FormControl('', [Validators.email, Validators.required]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  navigateRegister() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/register']);
    }, 3000);
  }
  
async validarRegistroUsuario()
{      
    let estadoCliente : String   = "" ;
    try
    {
      const snapshot = await this.firestoreService.getUsuarios();
      snapshot.forEach(element => {
        estadoCliente = element.estadoCliente;
        if(element.contrasena == this.loginForm.value.pass && element.correo == this.loginForm.value.email && (element.estadoCliente == "pendiente" || element.estadoCliente == "rechazado"))  throw new Error;
      });
    }
    catch
    {
      if(estadoCliente == "pendiente") {
        this.alertaError('Cuenta pendiente', `Tu cuenta aún no fue habilitada, se encuentra en estado ${estadoCliente}.`);
      } 
      else if(estadoCliente == "rechazado") {
        this.alertaError('Cuenta rechazada', `La habilitación de tu cuenta fue rechazada. Lo sentimos.`);
      }
      throw new Error;
    }
}

  alertaError(title: string, text: string) {
    sweetAlertConfig.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      backdrop: `rgba(0,0,0,0.8)`,
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');   
      }
    });   
  }

 async onSubmit() {
  console.log("Antes de entrar");
  this.isLoading = true;
    await this.validarRegistroUsuario();
    console.log("Ya lo pase");
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.pass)
        .then((res: any) => {
          if(res.user.email !== null) {
            this.userService.getUserProfile(res.user.uid)
              .then((userProfile: any) => {
                this.isLoading = false;
                this.cargarMenuPorRol(userProfile.rol);
              })
              .catch(err => {
                console.log('Error al obtener datos de usuario: ', err);
              })
              .finally(() => {
                this.loginForm.controls.email.setValue('');
                this.loginForm.controls.pass.setValue('');
                this.errorMsg = '';
              });
          }
        })
        .catch(err => {
          switch(err.code) {
            case 'auth/invalid-email': 
              this.alertaError('Error', `El correo electrónico no es válido.`);
              break;
  
            case 'auth/missing-password': 
              this.alertaError('Error', `La contraseña no es válida.`);
              break;
              
            case 'auth/invalid-credential': 
              this.alertaError('Error', `El correo electrónico o contraseña son incorrectos.`);
              break;

            default: 
              this.alertaError('Error', `Ocurrio un error en el inicio de sesión.`);
              break;
          }
        });
    }
  }


  cargarMenuPorRol(rol: string) {
    switch(rol) {
      case 'dueno':
      case 'supervisor':
        this.router.navigate(['/menu-admin']);
        break;
        
      case 'maitre':
        this.router.navigate(['/menu-maitre']);
        break;

      case 'mozo':
        this.router.navigate(['/menu-mozo']);
        break;

      case 'cocinero':
      case 'bartender':
        this.router.navigate(['/menu-empleado']);
        break;
        
      case 'cliente':
        this.router.navigate(['/ingreso-mesa']);
        break;
    }
  }


  fillForm(email: string, pass: string) {
    this.loginForm.controls.email.setValue(email);
    this.loginForm.controls.pass.setValue(pass); 
  }
}
