import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { BehaviorSubject } from 'rxjs';
import { FirestoreService } from './firestore.service';
import { deleteToken } from 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  private uidUser: string = '';
  private enable: boolean = false;

  constructor(private firestoreService: FirestoreService) { }


  init(uid: string) {
    console.log('Initializing HomePage');

    this.uidUser = uid;

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    this.addListeners();
  }

  addListeners() {
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      // alert('Push registration success, token: ' + token.value);
      this.saveToken(token.value);
      this.enable = true;
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      alert('Push received: ' + JSON.stringify(notification));
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      alert('Push action performed: ' + JSON.stringify(notification));
    });
  }

  private async saveToken(token: string) {
    console.log('Saving token:', token);

    const updateDoc = {
      token
    }
    await this.firestoreService.updateDocument(`usuarios/${this.uidUser}`, updateDoc);

    console.log('Token saved in Firestore');
  }

  async deleteToken() {
    if(this.enable) {
      const updateDoc = {
        token: null
      }

      await this.firestoreService.updateDocument(`usuarios/${this.uidUser}`, updateDoc);
    }
  }
}