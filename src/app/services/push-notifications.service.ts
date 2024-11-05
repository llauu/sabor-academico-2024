import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {
  private apiUrl = 'https://server-sabor-academico.onrender.com';

  constructor(private http: HttpClient) { }

  sendNotification(token: string, title: string, body: string) {
    const payload = { token, title, body };
    this.sendHttpPostRequest('/notify', payload);
  }

  sendNotificationToRole(title: string, body: string, role: any) {
    const payload = { title, body, role };
    this.sendHttpPostRequest('/notify-role', payload);
  }

  // sendNotificationToType(title: string, body: string, tipo: any) {
  //   const payload = { title, body, tipo };
  //   this.sendHttpPostRequest('/notify-type', payload);
  // }

  sendMail(aceptacion: boolean, nombreUsuario: string, mail: string) {
    const payload = { aceptacion, nombreUsuario, mail };
    this.sendHttpPostRequest('/send-mail', payload);
  }

  private sendHttpPostRequest(endpoint: string, payload: any) {
    this.http.post<any>(`${this.apiUrl}${endpoint}`, payload).subscribe({
      next: response => console.log('Notificación enviada', response),
      error: error => console.error('Error al enviar la notificación', error),
      complete: () => console.log('Notificación procesada completamente')
    });
  }

}
