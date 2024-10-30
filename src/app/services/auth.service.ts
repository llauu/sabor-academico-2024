import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Auth, authState, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState = authState(this.auth);

  constructor(private firestoreService: FirestoreService, private auth: Auth) {
    this.auth.languageCode = 'es';    
  }


  async createUser(email: string, password: string) {
    const user = await createUserWithEmailAndPassword(this.auth, email, password);

    // if(user) {
    //   sendEmailVerification(user.user);
    //   this.logout(false);
    // }

    return user;
  }

  getCurrentUser() {
    return this.auth.currentUser
  }


  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Login con verificacion de email
  // async login(email: string, password: string) {
  //   return new Promise((resolve, reject) => {
  //     signInWithEmailAndPassword(this.auth, email, password)
  //       .then((userCredential: any) => {
  //         // if(userCredential.user.emailVerified) {
  //         //   resolve(userCredential);
  //         // }
  //         // else {
  //         //   this.logout(false) 
  //         //     .then(() => {
  //         //       reject('Debes verificar tu correo electronico ingresar.');
  //         //     });
  //         // }
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // }


  async logout(reload = true) {
    await signOut(this.auth);
  }
}
