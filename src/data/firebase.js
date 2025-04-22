import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDzyg1tkaGTh2GK43z3XzPcuC6C5Dtj-hM",
    authDomain: "furlada-shop.firebaseapp.com",
    projectId: "furlada-shop",
    storageBucket: "furlada-shop.firebasestorage.app",
    messagingSenderId: "295196263428",
    appId: "1:295196263428:web:5cd4c71e6521569f0ae151",
    measurementId: "G-0GZVSPFECC"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, firebaseConfig };
