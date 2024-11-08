import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Output, EventEmitter } from '@angular/core';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: 'qr-scanner.component.html',
  styleUrls: ['qr-scanner.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, MatIconModule]
})
export class Scanner {
  @Output() scanResult = new EventEmitter<string>();
  scannedResult: string | null = null;

  startScan = async () => {
    document.querySelector('.scanner-area')?.classList.add('barcode-scanner-active');

    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode, BarcodeFormat.Pdf417, BarcodeFormat.Code128],
      });

      if (barcodes && barcodes.length > 0) {
        this.scannedResult = barcodes[0].displayValue || 'Código escaneado sin valor visible';
        this.scanResult.emit(this.scannedResult); // Emitimos el resultado del escaneo
        console.log('Código escaneado:', this.scannedResult);
      } else {
        console.log('No se detectaron códigos');
      }
    } catch (error) {
      console.error('Error al escanear el código:', error);
    }
  };

  stopScan = async () => {
    document.querySelector('.scanner-area')?.classList.remove('barcode-scanner-active');
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  };
}
