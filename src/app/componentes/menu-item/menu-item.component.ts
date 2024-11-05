import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';


import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { SwiperModule } from 'swiper/angular';


// Registra los módulos de Swiper que necesitas
SwiperCore.use([Autoplay, Pagination, Navigation]);

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [CommonModule, IonicModule]
})

export class MenuItemComponent  implements OnInit {


 swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: { clickable: true },
    navigation: true
  };

  
  

  images = [
    'https://firebasestorage.googleapis.com/v0/b/clinicafaccinitrinidad.appspot.com/o/productos%2Fmilanesa_pollo_1.png?alt=media&token=ac7b5092-3dc7-4d1f-80a3-af44fd674a76',
    'https://firebasestorage.googleapis.com/v0/b/clinicafaccinitrinidad.appspot.com/o/productos%2Fmilanesa_pollo_2.png?alt=media&token=c554b57f-9138-44d9-a1bf-411d7806ea42',
    'https://firebasestorage.googleapis.com/v0/b/clinicafaccinitrinidad.appspot.com/o/productos%2Fmilanesa_pollo_3.png?alt=media&token=ad246709-3b63-4f6a-9e70-5e2f74d7af1b'
  ]
  @Input() product: any;
  @Input() quantity: number = 1;

  constructor() { }


  ngOnInit() {
    console.log('Images:', this.images);  // Verifica que hay varias URLs en el array
  }
  

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
