import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Auth, authState, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut,UserCredential  } from '@angular/fire/auth';
import { FcmService } from './fcm.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState = authState(this.auth);

  constructor(private firestoreService: FirestoreService, private auth: Auth, private fmc: FcmService) {
    this.auth.languageCode = 'es';    
  }

  async createUser(clienteData: any, email: string, password: string) {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const clienteId = await this.firestoreService.createDocument(`usuarios`, { ...clienteData }, userCredential.user.uid);
      console.log('Cliente agregado a Firestore con ID:', clienteId);
      return userCredential;
    } catch (error) {
      console.error('Error al crear usuario o agregarlo a Firestore:', error);
      throw error;
    }
  }
  getCurrentUser() {
    return this.auth.currentUser
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(reload = true) {
    await this.fmc.deleteToken();
    await signOut(this.auth);
  }
}
