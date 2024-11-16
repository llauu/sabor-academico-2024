import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { SpinnerComponent } from 'src/app/componentes/spinner/spinner.component';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
//import Swal from 'sweetalert2';
import { sweetAlertConfig } from 'sweet-alert-config';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-menu-cliente',
  templateUrl: './menu-cliente.page.html',
  styleUrls: ['./menu-cliente.page.scss'],
  standalone: true,
  imports: [ MatIconModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, SpinnerComponent, IonIcon, IonButton]
})
export class MenuClientePage implements OnInit {

  constructor(private userService: UserService, public router: Router, private firestoreService: FirestoreService) { 
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    addIcons({ logOutOutline });
  }

  
  abrirChat() {
    this.router.navigate(['/chat-mozo']);
  }

  hacerPedido(){
    this.router.navigate(['/menu'])
  }

  // Funcion para abrir el modal con los resultados de las encuestas a clientes
  async mostrarEncuestasCliente() {
    const encuestas = await this.firestoreService.getEncuestas();
  
    const calificaciones: number[] = [];
    const atencionMozo: string[] = [];
    const aspectosCondicion: any = {
      iluminacion: 0,
      ventilacion: 0,
      ambiente: 0,
      ruido: 0,
    };
    const recomendacion: string[] = [];

    encuestas.forEach(encuesta => {
      calificaciones.push(encuesta.calificacion);
      atencionMozo.push(encuesta.atencionMozo);
      encuesta.aspectosCondicion.forEach((aspecto: any) => {
        if (aspecto === 'Iluminación') aspectosCondicion.iluminacion++;
        if (aspecto === 'Ventilación') aspectosCondicion.ventilacion++;
        if (aspecto === 'Ambiente') aspectosCondicion.ambiente++;
        if (aspecto === 'Ruido') aspectosCondicion.ruido++;
      });
      recomendacion.push(encuesta.recomendacion);
    });

    sweetAlertConfig.fire({
      title: 'Resultados de las Encuestas',
      width: '90%',
      html: `
        <div class="modal-content">
          <div class="chart-container">
            <canvas id="calificacionChart" width="400" height="200"></canvas>
            <canvas id="atencionMozoChart" width="400" height="200"></canvas>
            <canvas id="aspectosCondicionChart" width="400" height="200"></canvas>
            <canvas id="recomendacionChart" width="400" height="200"></canvas>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonText: 'Cerrar',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');
        const modalContent = document.querySelector('.swal2-html-container') as HTMLElement;
        modalContent.style.overflowY = 'auto';
        modalContent.style.maxHeight = '570px';
  
        
        setTimeout(() => {
          new Chart('calificacionChart', {
            type: 'bar',
            data: {
              labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
              datasets: [{
                label: 'Calificación Promedio',
                data: Array.from({ length: 10 }, (_, i) => calificaciones.filter(c => Number(c) === i + 1).length), // Convierte 'c' a número
                backgroundColor: '#4caf50',
                borderColor: '#388e3c',
                borderWidth: 1,
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: { ticks: { autoSkip: false } },
              },
            }
          });
  
          new Chart('atencionMozoChart', {
            type: 'pie',
            data: {
              labels: ['Muy buena', 'Buena', 'Normal', 'Mala'],
              datasets: [{
                data: [
                  atencionMozo.filter(a => a === 'muy buena').length,
                  atencionMozo.filter(a => a === 'buena').length,
                  atencionMozo.filter(a => a === 'normal').length,
                  atencionMozo.filter(a => a === 'mala').length,
                ],
                backgroundColor: ['#8bc34a', '#cddc39', '#ffeb3b', '#f44336'],
                borderColor: '#ffffff',
                borderWidth: 2,
              }]
            },
            options: {
              responsive: true,
            }
          });
  
          new Chart('aspectosCondicionChart', {
            type: 'bar',
            data: {
              labels: ['Iluminación', 'Ventilación', 'Ambiente', 'Ruido'],
              datasets: [{
                label: 'Aspectos en buena condición',
                data: [aspectosCondicion.iluminacion, aspectosCondicion.ventilacion, aspectosCondicion.ambiente, aspectosCondicion.ruido],
                backgroundColor: '#3f51b5',
                borderColor: '#303f9f',
                borderWidth: 1,
              }]
            },
            options: {
              responsive: true,
            }
          });
  
          new Chart('recomendacionChart', {
            type: 'pie',
            data: {
              labels: ['Sí', 'No', 'Tal vez'],
              datasets: [{
                data: [
                  recomendacion.filter(r => r === 'si').length,
                  recomendacion.filter(r => r === 'no').length,
                  recomendacion.filter(r => r === 'tal vez').length,
                ],
                backgroundColor: ['#2196f3', '#f44336', '#ff9800'],
                borderColor: '#ffffff',
                borderWidth: 2,
              }]
            },
            options: {
              responsive: true,
            }
          });
        }, 500);
      }
    });
  }

  confirmLogout() {
    sweetAlertConfig.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#003049',
      cancelButtonColor: '#D62828',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Cerrar sesión',
      didOpen: () => {
        document.documentElement.classList.remove('swal2-height-auto');
        document.body.classList.remove('swal2-height-auto');
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.logOut();
      }
    });
  }

  logOut() {
    this.userService.logout()
      .then(() => {
        this.router.navigate(['/login']);
      });
  }
}
