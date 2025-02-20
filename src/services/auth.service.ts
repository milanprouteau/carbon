import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  email: string | null;
  uid: string;
}

export const signUp = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      email: userCredential.user.email,
      uid: userCredential.user.uid,
    };
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      email: userCredential.user.email,
      uid: userCredential.user.uid,
    };
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return {
      email: userCredential.user.email,
      uid: userCredential.user.uid,
    };
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = (): Promise<AuthUser | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: User | null) => {
        unsubscribe();
        if (user) {
          resolve({
            email: user.email,
            uid: user.uid,
          });
        } else {
          resolve(null);
        }
      },
      reject
    );
  });
};
