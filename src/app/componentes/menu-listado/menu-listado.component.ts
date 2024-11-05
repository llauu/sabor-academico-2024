import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-menu-listado',
  templateUrl: './menu-listado.component.html',
  styleUrls: ['./menu-listado.component.scss'],
  standalone: true,
  imports: [CommonModule, MenuItemComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MenuListadoComponent implements OnInit {
  
  products: any[] = [];

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit() {
    this.products = await this.firestoreService.getProductos();
    console.log('Productos obtenidos:', this.products);
  }
}

