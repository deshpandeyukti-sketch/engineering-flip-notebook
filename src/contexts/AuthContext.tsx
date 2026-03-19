import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../utils/firebase';
import type { User } from '../types';

const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === "YOUR_API_KEY" ||
  import.meta.env.VITE_FIREBASE_API_KEY.includes("your_");

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUser: User = {
  id: 'demo-user',
  email: 'demo@example.com',
  displayName: 'Demo User',
  createdAt: new Date()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          const newUser: User = {
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            photoURL: fbUser.photoURL || undefined,
            createdAt: new Date()
          };
          await setDoc(doc(db, 'users', fbUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      throw new Error('Firebase not configured. Use Demo mode to test.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (isDemoMode) {
      throw new Error('Firebase not configured. Use Demo mode to test.');
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      id: result.user.uid,
      email,
      displayName,
      createdAt: new Date()
    };
    await setDoc(doc(db, 'users', result.user.uid), newUser);
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      throw new Error('Firebase not configured. Use Demo mode to test.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      const newUser: User = {
        id: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'User',
        photoURL: result.user.photoURL || undefined,
        createdAt: new Date()
      };
      await setDoc(doc(db, 'users', result.user.uid), newUser);
    }
  };

  const signInDemo = () => {
    setUser(demoUser);
  };

  const logout = async () => {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, demoMode: isDemoMode, signIn, signUp, signInWithGoogle, signInDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
