import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingController, AlertController, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addDoc, collection, collectionData, doc, Firestore, orderBy, query, setDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';

@Component({
  selector: 'app-chat-mozo',
  templateUrl: './chat-mozo.page.html',
  styleUrls: ['./chat-mozo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ChatMozoPage implements OnInit {
  messageText: string = '';
  messages: any = [];
  user: any;
  sub: Subscription | null = null;
  loading!: HTMLIonLoadingElement;

  constructor(
    private firestore: Firestore,
    public auth: AuthService,
    public userService: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private pushNotifications: PushNotificationsService, private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.loadingCtrl.create().then(loading => {
      this.loading = loading;
      this.loading.present();
      this.userService.getState()
        .then(user => {
          this.user = user;
        });
      this.getMessages();
    });
  }

  sendMessage() {
    if (this.messageText !== '') {
      let col = collection(this.firestore, 'consultasMozos/chat/mensajes');
      addDoc(col, { 'fecha': new Date(), 'usuario': this.user.email, 'mensaje': this.messageText })
        .then(() => {
          this.pushNotifications.sendNotificationToRole('Has recibido una nueva consulta!', this.messageText, 'mozo');
        })
        .finally(() => {
          this.messageText = '';
        });
    }
  }
  
  getMessages() {
    let col = collection(this.firestore, 'consultasMozos/chat/mensajes');
    const orderQuery = query(col, orderBy('fecha', 'asc'));

    this.messages = [];
    const observable = collectionData(orderQuery);

    this.sub = observable.subscribe((res: any) => {
      this.messages = res;
      // Scroll hacia abajo al recibir nuevos mensajes
      setTimeout(() => {
        this.scrollToBottom();
        this.loading.dismiss();
      }, 0);
    });
  }

  formatUser(user: string): string {
    return user.split('@')[0];
  }

  formatTimestamp(timestamp: any): string {
    const date = timestamp.toDate(); 
    return formatDate(date, 'd MMM. y h:mm a', 'en-US'); 
  }

  scrollToBottom() {
    const chatMessages = document.getElementById('chat');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  volver() {
    this.sub?.unsubscribe();
    this.router.navigate(['/home']);
  }
}
