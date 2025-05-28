import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../data/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      checkAdmin(firebaseUser);
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
  const logout = () => signOut(auth);

  // Add a function to check admin status manually
  const checkIfAdmin = async (email) => {
    const q = query(collection(db, "admins"), where("email", "==", email));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, checkIfAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}