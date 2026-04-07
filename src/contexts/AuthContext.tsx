import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { User } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userRef = doc(db, 'users', fUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUser(userSnap.data() as User);
          } else {
            const newUser: User = {
              uid: fUser.uid,
              email: fUser.email || '',
              displayName: fUser.displayName || undefined,
              photoURL: fUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${fUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in', error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const deleteAccount = async () => {
    if (!firebaseUser) return;
    try {
      // Töröljük a felhasználó dokumentumát a Firestore-ból
      await deleteDoc(doc(db, 'users', firebaseUser.uid));
      // Töröljük magát az Auth felhasználót
      await deleteUser(firebaseUser);
    } catch (error: any) {
      console.error('Error deleting account', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('A fiók törléséhez kérjük, jelentkezz be újra!');
        await signOut();
      } else {
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
