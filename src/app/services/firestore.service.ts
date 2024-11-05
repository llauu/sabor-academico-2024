import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore, QuerySnapshot, collection, 
  collectionGroup, deleteDoc, doc, getDoc, getDocs, serverTimestamp, 
  setDoc, updateDoc} from '@angular/fire/firestore';

  
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) { }
  
  
  //---| CREATE |---//
  async createDocument<tipo>(path: string, data: tipo, id: string | null = null) {
    let refDoc;
    if (id) {
      refDoc = doc(this.firestore, `${path}/${id}`);
    } else {
      const refCollection = collection(this.firestore, path)
      refDoc = doc(refCollection);
    }
    const dataDoc: any = data;
    dataDoc.id = refDoc.id;
    dataDoc.fecha = serverTimestamp();
    await setDoc(refDoc, dataDoc);
    return dataDoc.id;
  }
  //----------------//


  //---| UPDATE |---//
  async updateDocument(path: string, data: any) {
    const refDoc = doc(this.firestore, path);
    return await updateDoc(refDoc, data);
  }
  //----------------//


  //---| DELETE |---//
  async deleteDocument(path: string) {
    const refDoc = doc(this.firestore, path);
    return await deleteDoc(refDoc);
  }
  //----------------// 


  //---| READ |---//
  async getDocument<tipo>(path: string) {
    const refDocument = doc(this.firestore, path);
    return await getDoc(refDocument) as DocumentSnapshot<tipo> ;    
  }

  async getDocuments<tipo>(path: string, group: boolean = false) {
    if (!group) {
      const refCollection = collection(this.firestore, path);
      return await getDocs(refCollection) as QuerySnapshot<tipo> ;    
    } else  {
      const refCollectionGroup = collectionGroup(this.firestore, path)
      return await getDocs(refCollectionGroup) as QuerySnapshot<tipo>;
    }
  }
  
  async getUsuarios() {
    const snapshot = await this.getDocuments<any>('usuarios');
    return snapshot.docs.map(doc => doc.data());
  }


  // Método para obtener todos los productos
  async getProductos() {
    try {
      const snapshot = await this.getDocuments<any>('productos');
      const productos = snapshot.docs.map(doc => doc.data());
      console.log('Productos obtenidos:', productos);
      return productos;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return [];
    }
  }
  


  // Método para obtener todas las imágenes de un producto
  // getProductImages(productName: string): Observable<string[]> {
  //   const imagePaths = [
  //     `productos/${productName}_1.png`,
  //     `productos/${productName}_2.png`,
  //     `productos/${productName}_3.png`
  //   ];
    
  //   Convertimos cada ruta de imagen en un Observable de su URL
  //   const imageObservables = imagePaths.map(path => from(getDownloadURL(ref(this.storage, path))));

  //   Usamos forkJoin para esperar a que todos los Observables completen
  //   return forkJoin(imageObservables);
  // }

}
