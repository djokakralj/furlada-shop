import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../data/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCart } from './CartContext'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  // Check if user is admin
  const checkAdmin = async (firebaseUser) => {
    if (!firebaseUser) {
      setIsAdmin(false);
      return;
    }
    const q = query(collection(db, "admins"), where("email", "==", firebaseUser.email));
    const snapshot = await getDocs(q);
    setIsAdmin(!snapshot.empty);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await checkAdmin(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    await signOut(auth);
    clearCart(); 
  };
  // Add a function to check admin status manually
  const checkIfAdmin = async (email) => {
    const q = query(collection(db, "admins"), where("email", "==", email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, checkIfAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}