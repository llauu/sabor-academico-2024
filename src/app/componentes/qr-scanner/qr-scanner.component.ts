import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  BarcodeScanner,
  BarcodeFormat,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: 'qr-scanner.component.html',
  styleUrls: ['qr-scanner.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})

export class Scanner  {

  scannedResult: string | null = null; // Define scannedResult aquí

  startScan = async () => {
    document.querySelector('.scanner-area')?.classList.add('barcode-scanner-active');

    try {
      // Realizar el escaneo
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode, BarcodeFormat.Pdf417, BarcodeFormat.Code128],
      });

      if (barcodes && barcodes.length > 0) {
        // Muestra el resultado del primer código escaneado
        this.scannedResult = barcodes[0].displayValue || 'Código escaneado sin valor visible';
        console.log('Código escaneado:', this.scannedResult);
      } else {
        console.log('No se detectaron códigos');
      }
    } catch (error) {
      console.error('Error al escanear el código:', error);
    } finally {
      // Restablece la interfaz de usuario
      document.querySelector('body')?.classList.remove('barcode-scanner-active');
    }
};

  stopScan = async () => {
    document.querySelector('.scanner-area')?.classList.remove('barcode-scanner-active');
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
  };

  // scanSingleBarcode = async () => {
  //   return new Promise(async resolve => {
  //     document.querySelector('body')?.classList.add('barcode-scanner-active');

  //     const listener = await BarcodeScanner.addListener(
  //       'barcodeScanned',
  //       async result => {
  //         await listener.remove();
  //         document.querySelector('body')?.classList.remove('barcode-scanner-active');
  //         await BarcodeScanner.stopScan();
  //         this.scannedResult = result.barcode; // Guarda el resultado escaneado
  //         resolve(result.barcode);
  //       },
  //     );

  //     await BarcodeScanner.startScan();
  //   });
  // };

  scan = async () => {
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.QrCode, BarcodeFormat.Pdf417],
    });
    this.scannedResult = barcodes.join(', '); // Guarda todos los códigos escaneados si hay varios
    return barcodes;
  };

  isSupported = async () => {
    const { supported } = await BarcodeScanner.isSupported();
    return supported;
  };


  isTorchEnabled = async () => {
    const { enabled } = await BarcodeScanner.isTorchEnabled();
    return enabled;
  };

  isTorchAvailable = async () => {
    const { available } = await BarcodeScanner.isTorchAvailable();
    return available;
  };

  setZoomRatio = async () => {
    await BarcodeScanner.setZoomRatio({ zoomRatio: 0.5 });
  };

  getZoomRatio = async () => {
    const { zoomRatio } = await BarcodeScanner.getZoomRatio();
    return zoomRatio;
  };

  getMinZoomRatio = async () => {
    const { zoomRatio } = await BarcodeScanner.getMinZoomRatio();
    return zoomRatio;
  };

  getMaxZoomRatio = async () => {
    const { zoomRatio } = await BarcodeScanner.getMaxZoomRatio();
    return zoomRatio;
  };

  openSettings = async () => {
    await BarcodeScanner.openSettings();
  };

  isGoogleBarcodeScannerModuleAvailable = async () => {
    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    return available;
  };

  installGoogleBarcodeScannerModule = async () => {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  };

  checkPermissions = async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  };

  requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  };
}
