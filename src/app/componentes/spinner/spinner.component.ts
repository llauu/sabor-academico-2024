import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//  templateUrl: './splash.component.html',
@Component({
  selector: 'app-spinner',
  imports :[CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone :true

})
export class SpinnerComponent implements OnInit {
  isVisible: boolean = true;

  ngOnInit() {
    setTimeout(() => {
      this.isVisible = false;
    }, 3000); // Ocultar después de 3 segundos
  }
}
