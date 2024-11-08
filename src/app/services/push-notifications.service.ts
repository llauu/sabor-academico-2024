import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  private apiUrl = 'https://server-sabor-academico.onrender.com';

  constructor(private http: HttpClient) {}

  sendNotification(token: string, title: string, body: string) {
    const payload = { token, title, body };
    console.log('payload noti: ', payload);

    this.sendHttpPostRequest('/notify', payload);
  }

  sendNotificationToRole(title: string, body: string, role: any) {
    const payload = { title, body, role };
    console.log('payload role', payload);

    this.sendHttpPostRequest('/notify-role', payload);
  }

  sendMail(aceptacion: boolean, nombreUsuario: string, mail: string) {
    const payload = { aceptacion, nombreUsuario, mail };
    this.sendHttpPostRequest('/send-mail', payload);
  }

  sendMailreject(nombreUsuario: string, mail: string) {
    const payload = {nombreUsuario, mail };
    this.sendHttpPostRequest('/reject-mail', payload);
  }
  
  private sendHttpPostRequest(endpoint: string, payload: any) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<any>(url, payload, { headers }).subscribe({
      next: response => console.log('Notificación enviada', response),
      error: error => console.error('Error al enviar la notificación', error),
      complete: () => console.log('Notificación procesada completamente')
    });
  }
}
