import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingController , IonButton, IonInput, IonItem, IonLabel, IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonFooter, IonButtons } from '@ionic/angular/standalone';
import { FormsModule, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { FirestoreService } from '../../services/firestore.service';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { ExceptionCode } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonInput, IonGrid, IonRow, IonCol, CommonModule, ReactiveFormsModule, FormsModule]
})
export class LoginPage implements OnInit {
  loginForm: any;
  errorMsg: string = '';
  loading!: HTMLIonLoadingElement;

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

  navigateRegister(){
    this.router.navigate(['/register'])
  }

async validarRegistroUsuario()
{      
    let estadoCliente : String   = "" ;
    try
    {
      const snapshot = await this.firestoreService.getUsuariosPendientes<any>('usuarios');
      const clientes = snapshot.docs.map((doc: QueryDocumentSnapshot<any>) => ({
        id: doc.id,
        estadoCliente : doc.data().estadoCliente,
        correo : doc.data().correo,
        contra : doc.data().contrasena,
      }));
      clientes.forEach(element => {

        estadoCliente = element.estadoCliente;
        if(element.contra == this.loginForm.value.pass && element.correo == this.loginForm.value.email && element.estadoCliente == "pendiente")  throw new Error;
      });
    }
    catch
    {
      this.errorMsg = `La cuenta aun no fue habilitada, se encuentra en estado ${estadoCliente}` ;
      throw new Error;
    }
}

 async onSubmit() {
    await this.validarRegistroUsuario();
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.pass)
        .then((res: any) => {
          if(res.user.email !== null) {
            this.userService.getUserProfile(res.user.uid)
              .then((userProfile: any) => {
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
        this.router.navigate(['/menu-cliente']);
        break;
    }
  }


  fillForm(email: string, pass: string) {
    this.loginForm.controls.email.setValue(email);
    this.loginForm.controls.pass.setValue(pass); 
  }
}
