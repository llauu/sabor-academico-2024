import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';
import { FcmService } from './fcm.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private logged: boolean = false;  
  private user: any; // User auth
  private userProfile: any; // User profile
  

  constructor(private authService: AuthService, private firestoreService: FirestoreService, private router: Router, private fcm: FcmService) {
    console.log('UserService init');
    this.getState();
  }
  
  setUserData(user: any) {
    this.user = user;
    this.userProfile = user;
    this.logged = true;

    console.log('User data set: ', this.user);
    console.log('User profile set: ', this.userProfile);
    console.log('Logged: ', this.logged);
  }
  
  getState() {
    return new Promise((resolve, reject) => {
      if(this.logged) {
        resolve(this.user);
        return;
      }

      this.authService.authState.subscribe((res) => {
        if(res) {
          this.user = res;
          this.logged = true;

          // Obtenemos datos del usuario (firestore)
          this.getUserProfile(this.user.uid)
            .then(() => {
              // Inicializamos push n
              this.fcm.init(this.user.uid);
            });
        } else {
          this.user = null;
          this.logged = false;
        }
        resolve(this.user);
      });
    });
  }
  
  // Obtiene datos del usuario desde Firestore
  async getUserProfile(uid: string) {
    return new Promise( async (resolve) => {
        if (this.userProfile) {
          resolve(this.userProfile);
          return;
        }

        const response = await this.firestoreService.getDocument(`usuarios/${uid}`)
        if (response.exists()) {  
            this.userProfile = response.data();

            console.log('User profile: ', this.userProfile);
            resolve(this.userProfile);
            if (this.userProfile.email != this.user.email) {
              console.log('sincronizar email');
              const updateData = {email: this.user.email};
              this.firestoreService.updateDocument(`usuarios/${uid}`, updateData)
            }
        } 
    });
  }

  async getId(): Promise<string | null> {
    if(this.user.tipoCliente == 'anonimo'){
      return this.user.id;
    }

    await this.getState(); // Espera a que `getState` se complete

    console.log(this.userProfile ? this.userProfile.id : null)
    return this.user ? this.userProfile.id : null;
  }

  getLogged() {
    return this.logged;
  }

  getRol() {
    return this.userProfile.rol;
  }

  getToken() {
    return this.userProfile.token;
  }

  getTipoCliente() {
    return this.user.tipoCliente;
  }

  getUserAnonimo() {
    return this.user;
  }

  async getName() {
    if(this.user.tipoCliente == 'anonimo'){
      return this.user.nombre;
    }

    await this.getState(); // Espera a que `getState` se complete
    return this.user ? this.userProfile.nombre + ' ' + this.userProfile.apellido : null; 
  }

  logout() {
    this.logged = false;
    this.user = null;
    this.userProfile = null;
    this.router.navigate(['/login']);
    return this.authService.logout();
  }
}
