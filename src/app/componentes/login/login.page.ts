import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingController , IonButton, IonInput, IonItem, IonLabel, IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, IonFooter } from '@ionic/angular/standalone';
import { FormsModule, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonGrid, IonRow, IonCol, IonFooter, CommonModule, ReactiveFormsModule, FormsModule]
})
export class LoginPage implements OnInit {
  loginForm: any;
  errorMsg: string = '';
  loading!: HTMLIonLoadingElement;


  constructor(public authService: AuthService, private userService: UserService, private router: Router, private loadingCtrl: LoadingController) { 
    if(this.userService.getLogged()) {
      this.router.navigate(['/home']);
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


  onSubmit() {
    this.loading.present();
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.pass)
        .then((res: any) => {
          if(res.user.email !== null) {
            this.loginForm.controls.email.setValue('');
            this.loginForm.controls.pass.setValue('');
            this.errorMsg = '';
            this.router.navigate(['/home']);
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


  fillForm(email: string, pass: string) {
    this.loginForm.controls.email.setValue(email);
    this.loginForm.controls.pass.setValue(pass); 
  }
}
