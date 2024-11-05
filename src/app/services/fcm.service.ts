import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { BehaviorSubject } from 'rxjs';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {


  constructor(private firestoreService: FirestoreService) {
    this.init();
   }


  init() {
    console.log('Initializing HomePage');

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
      console.log(token.value);
      alert('Push registration success, token: ' + token.value);

      this.firestoreService.updateDocument('usuarios', { token: token.value });
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


  // private _redirect = new BehaviorSubject<any>(null);

  // get redirect() {
  //   return this._redirect.asObservable();
  // }

  // constructor(private firestoreService: FirestoreService) { }

  // initPush(id: string) {
  //   console.log('22» initPush called with id:', id);
  //   if (Capacitor.getPlatform() !== 'web') {
  //     console.log("entro init push")
  //     this.registerPush(id);
  //     this.getDeliveredNotifications();
  //   }
  // }

  // private async registerPush(docUserId: string) {
  //   console.log('31» regiserPusth called with id:', docUserId);
  //   try {
  //     this.addListeners(docUserId);
  //     let permStatus = await PushNotifications.checkPermissions();

  //     if (permStatus.receive === 'prompt') {
  //       permStatus = await PushNotifications.requestPermissions();
  //     }

  //     if (permStatus.receive !== 'granted') {
  //       throw new Error('User denied permissions!');
  //     }

  //     await PushNotifications.register();
  //   } catch (e) {
  //     console.log('46» Error in registerPush:', e);
  //   }
  // }

  // async unregisterPush(docUserId: string) {
  //   await this.updateTokenInFirestore('', docUserId);
  //   await PushNotifications.removeAllListeners();
  // }

  // async getDeliveredNotifications() {
  //   const notificationList = await PushNotifications.getDeliveredNotifications();
  //   console.log('58» delivered notifications:', notificationList);
  // }

  // addListeners(docUserId: string) {
  //   PushNotifications.addListener('registration', async (token: Token) => {
  //       const fcm_token = token?.value;

  //       try {
  //         // Obtener el token guardado en Firestore
  //         const user = await this.firestoreService.getDocument('usuarios', docUserId);
  //         console.log(user);
  //         // const saved_token = user?['token']
          
  //         // Comparar el token actual con el token guardado
  //         // Según el estado, guardar o actualizar el token en Firestore
  //         // if (!saved_token || saved_token !== fcm_token) {
  //         //   await this.updateTokenInFirestore(fcm_token, docUserId);
  //         // }
  //       } catch (e) {
  //         console.error('Error getting user or token:', e);
  //       }
  //     }
  //   );

  //   PushNotifications.addListener('registrationError', (error: any) => {
  //     console.log('87» registrationError event:', JSON.stringify(error));
  //   });

  //   PushNotifications.addListener(
  //     'pushNotificationReceived',
  //     async (notification: PushNotificationSchema) => {
  //       console.log('93» pushNotificationReceived event:', JSON.stringify(notification));

  //       const data = notification?.data;
  //       if (data?.redirect) this._redirect.next(data?.redirect);
  //     }
  //   );

  //   PushNotifications.addListener(
  //     'pushNotificationActionPerformed',
  //     async (notification: ActionPerformed) => {
  //       const data = notification.notification.data;
  //       console.log('104» pushNotificationActionPerformed event:', JSON.stringify(notification.notification));
  //       console.log('105» push data:', data);
  //       if (data?.redirect) this._redirect.next(data?.redirect);
  //     }
  //   );
  // }

  // async updateTokenInFirestore(newToken: string, docUserId: string) {
  //   try {
  //     console.log('113» updateTokenInFirestore called with newToken:', newToken??'NONE', ' and id:', docUserId);
  //     // Actualizar el token en Firestore
  //     // this.db.actualizarDoc(Colecciones.Usuarios, docUserId, { token: newToken });
  //     console.log('116» Token updated in Firestore');
  //   } catch (error) {
  //     console.error('118» Error updating token in Firestore:', error);
  //   }
  // }
}