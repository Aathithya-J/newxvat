import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDknoxIQcfBgQbFPE3JZEVh7o6wQyV77CU",
  authDomain: "xvatai.firebaseapp.com",
  projectId: "xvatai",
  storageBucket: "xvatai.firebasestorage.app",
  messagingSenderId: "571687658296",
  appId: "1:571687658296:web:955d4ac969606f08f657cd",
  measurementId: "G-E5FQMPBHG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function getToken() {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  throw new Error("User not authenticated");
}
