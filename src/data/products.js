
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from './firebase.js';

const db = getFirestore(app);

const productsCollection = collection(db, 'products'); // Reference to 'products' collection

// Function to get all products
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(productsCollection);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
}

// Other product functions remain the same...


// Function to add a new product
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(productsCollection, productData);
    console.log('Product added with ID:', docRef.id);
    return docRef.id; // Return the ID of the new product
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Function to update an existing product
export async function updateProduct(productId, updatedData) {
  try {
    const productDoc = doc(db, 'products', productId);
    await updateDoc(productDoc, updatedData);
    console.log('Product updated with ID:', productId);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Function to delete a product
export async function deleteProduct(productId) {
  try {
    const productDoc = doc(db, 'products', productId);
    await deleteDoc(productDoc);
    console.log('Product deleted with ID:', productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}


