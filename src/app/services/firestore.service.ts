import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore, QuerySnapshot, collection, 
  collectionGroup, deleteDoc, doc, getDoc, getDocs, serverTimestamp, where, query,
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
    dataDoc.creado = serverTimestamp();
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
  async getUsuariosPendientes<tipo>(path: string, group: boolean = false) {
    let refCollection;
  
    if (!group) {
      refCollection = collection(this.firestore, path);
  
      // Aplicar filtros para rol y estadoCliente
      const q = query(refCollection, 
                      where('rol', '==', 'cliente'), 
                      where('estadoCliente', '==', 'pendiente'));
  
      return await getDocs(q) as QuerySnapshot<tipo>;
    } else {
      refCollection = collectionGroup(this.firestore, path);
  
      // Aplicar filtros para rol y estadoCliente en una colección agrupada
      const q = query(refCollection, 
                      where('rol', '==', 'cliente'), 
                      where('estadoCliente', '==', 'pendiente'));
  
      return await getDocs(q) as QuerySnapshot<tipo>;
    }
  }
  
  
  async getUsuarios() {
    const snapshot = await this.getDocuments<any>('usuarios');
    return snapshot.docs.map(doc => doc.data());
  }
}
