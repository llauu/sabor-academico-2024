import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [CommonModule, IonicModule]
})

export class MenuItemComponent {

  @Input() imagenes: any; 

  cantidad = 0;
  currentIndex = 0;
  expanded: boolean = false;

  prev() {
    this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.imagenes.length - 1;
  }

  next() {
    this.currentIndex = (this.currentIndex < this.imagenes.length - 1) ? this.currentIndex + 1 : 0;
  }

}
