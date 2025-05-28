// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Dodaj auth import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzyg1tkaGTh2GK43z3XzPcuC6C5Dtj-hM", // <-- Replace with your actual API Key
  authDomain: "furlada-shop.firebaseapp.com",
  projectId: "furlada-shop",
  storageBucket: "furlada-shop.appspot.com",
  messagingSenderId: "295196263428",
  appId: "1:295196263428:web:5cd4c71e6521569f0ae151",
  measurementId: "G-0GZVSPFECC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore and Auth services
const db = getFirestore(app);
const auth = getAuth(app); // Dodaj auth instancu

// Export the app, db, and auth instances so they can be used in other files
export { app, db, auth };