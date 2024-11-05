import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private logged: boolean = false;  
  private user: any; // User auth
  private userProfile: any; // User profile
  

  constructor(private authService: AuthService, private firestoreService: FirestoreService, private router: Router) {
    console.log('UserService init');
    this.getState();
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

          // this.getUserProfile();
        } else {
          this.user = null;
          this.logged = false;
        }
        resolve(this.user);
      });
    });
  }
  
  // Obtiene datos del usuario desde Firestore
  // async getUserProfile() {
  //   return new Promise( async (resolve) => {
  //       if (this.userProfile) {
  //         resolve(this.userProfile);
  //         return;
  //       }

  //       const response = await this.firestoreService.getDocument(`usuarios`, this.user.uid);
  //       if (response.exists()) {  
  //           this.userProfile = response.data();
  //           resolve(this.userProfile);
  //           if (this.userProfile.email != this.user.email) {
  //             const updateData = {email: this.user.email};
  //             this.firestoreService.updateDocument(`usuarios/${this.user.uid}`, updateData)
  //           }
  //       }
  //   });
  // }

  
  getUid() {
    return this.user;
  }

  getLogged() {
    return this.logged;
  }

  getRol() {
    return this.userProfile.rol;
  }

  logout() {
    this.logged = false;
    this.user = null;
    this.userProfile = null;
    this.router.navigate(['/home']);
    return this.authService.logout();
  }
}
