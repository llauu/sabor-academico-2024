import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingController , IonButton, IonInput, IonItem, IonLabel, IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonFooter, IonButtons } from '@ionic/angular/standalone';
import { FormsModule, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FirestoreService } from '../../services/firestore.service';
import {SpinnerComponent} from '../../componentes/spinner/spinner.component'

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
  loading!: HTMLIonLoadingElement;
  public audioInicioSesion = new Audio('../../../assets/inicioSesion.mp3');
  private currentAudio: HTMLAudioElement | null = null;
  constructor(private firestoreService: FirestoreService, public authService: AuthService, private userService: UserService, private router: Router, private loadingCtrl: LoadingController) { 
    if(this.userService.getLogged()) {
      this.cargarMenuPorRol(this.userService.getRol());
    }
  }

  ngOnInit() {
    this.loginForm = new FormGroup ({
      email: new FormControl('', [Validators.email, Validators.required]),
      pass: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

    this.loadingCtrl.create()
      .then(loading => {
        this.loading = loading;
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
      if(estadoCliente == "pendiente") this.errorMsg = `La cuenta aún no fue habilitada, se encuentra en estado ${estadoCliente}.` ;
      else if(estadoCliente == "rechazado") this.errorMsg = `La habilitación de su cuenta fue rechazada.` ;
      throw new Error;
    }
}
playAudio(audio: HTMLAudioElement) {
  audio.load();
  audio.play().catch(err => console.error('Error al reproducir el audio:', err));
}
 async onSubmit() {
  console.log("Antes de entrar");
  this.isLoading = true;
  this.currentAudio = this.audioInicioSesion;
  this.playAudio(this.audioInicioSesion);
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
              this.errorMsg = 'El correo electrónico no es válido.';
              break;
  
            case 'auth/missing-password': 
              this.errorMsg = 'La contraseña no es válida.';
              break;
              
            case 'auth/invalid-credential': 
              this.errorMsg = 'El correo electrónico o contraseña son incorrectos.';
              break;

            default: 
              this.errorMsg = 'Ocurrio un error en el inicio de sesión.';
              break;
          }
        })
        .finally(() => {
          this.loading.dismiss();
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
