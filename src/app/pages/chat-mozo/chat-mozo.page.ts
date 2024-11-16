import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingController, AlertController, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addDoc, collection, collectionData, doc, Firestore, getDocs, orderBy, query, setDoc, where } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
import { SpinnerComponent } from 'src/app/componentes/spinner/spinner.component';


@Component({
  selector: 'app-chat-mozo',
  templateUrl: './chat-mozo.page.html',
  styleUrls: ['./chat-mozo.page.scss'],
  standalone: true,
  imports: [SpinnerComponent,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ChatMozoPage implements OnInit {
  messageText: string = '';
  messages: any = [];
  user: any;
  sub: Subscription | null = null;
  loading!: HTMLIonLoadingElement;
  nombreUsuario: string = '';
  userProfile: any;

  constructor(
    private firestore: Firestore,
    public auth: AuthService,
    public userService: UserService,
    private router: Router,
    private pushNotifications: PushNotificationsService, private alertController: AlertController
  ) {}

  async ngOnInit() {
      this.userService.getState()
        .then(user => {
          this.user = user;

          this.userService.getUserProfile(this.user.uid)
            .then((userProfile: any) => {
              this.userProfile = userProfile;

              if(userProfile.rol == 'cliente') {
                this.obtenerMesaPorUser(this.user.uid)
                .then((mesa) => {
                  console.log(mesa);
                  this.nombreUsuario = `${userProfile.nombre} | Mesa ${mesa!['number']}`;
                })
              }
              else {
                this.nombreUsuario = `${userProfile.nombre} ${userProfile.apellido} | Mozo`;
              }
            });
          
          this.getMessages();
    });
  }

  async obtenerMesaPorUser(uid: string) {
    const col = collection(this.firestore, 'listaMesas');
  
    // Aplicar filtros para rol y estadoCliente
    const q = query(col, 
                    where('userID', '==', uid));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    } else {
      console.log('No se encontró ninguna mesa con el userId proporcionado.');
      return null;
    }
  }

  sendMessage() {
    if (this.messageText !== '') {
      let col = collection(this.firestore, 'consultasMozos/chat/mensajes');
      addDoc(col, { 'fecha': new Date(), 'email': this.user.email, 'userID': this.user.uid, 'usuario': this.nombreUsuario, 'mensaje': this.messageText })
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

    if(this.userProfile.rol == 'cliente') {
      this.router.navigate(['/menu-cliente']);
    }
    else {
      this.router.navigate(['/menu-mozo']);
    }
  }
}
