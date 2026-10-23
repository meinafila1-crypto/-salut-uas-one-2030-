import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const AUTHORIZED_ADMIN_EMAIL = 'meinafila1@gmail.com';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  adminEmail: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isLoading: true,
  adminEmail: null,
  loginWithGoogle: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();
        if (email === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          try {
            await setDoc(doc(db, 'admins', user.uid), {
              email: user.email,
              role: 'superadmin',
              updatedAt: new Date().toISOString()
            }, { merge: true });
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            setIsAdmin(adminDoc.exists());
          } catch (e) {
            console.warn('Admin record sync notice:', e);
            setIsAdmin(true);
          }
        } else {
          // Strictly reject any other email from admin privileges
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user || !user.email) {
        await signOut(auth);
        setIsAdmin(false);
        throw new Error('Gagal mendapatkan informasi akun Google.');
      }

      const email = user.email.toLowerCase().trim();
      if (email === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        try {
          await setDoc(doc(db, 'admins', user.uid), {
            email: user.email,
            role: 'superadmin',
            updatedAt: new Date().toISOString()
          }, { merge: true });
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          setIsAdmin(adminDoc.exists());
        } catch (e) {
          console.warn('Admin record sync notice:', e);
          setIsAdmin(true);
        }
      } else {
        // Sign out immediately so no unauthorized admin session lingers
        await signOut(auth);
        setIsAdmin(false);
        throw new Error('Akses ditolak. Menu Staf/Admin hanya dapat diakses oleh akun administrator resmi SALUT UAS ONE 2030.');
      }
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsAdmin(false);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        adminEmail: currentUser?.email || null,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
