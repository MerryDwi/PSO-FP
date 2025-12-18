import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRQaEYKS-erNIpHYkztQ60sJ8dpSO3eVE",
  authDomain: "pso-fp-development.firebaseapp.com",
  projectId: "pso-fp-development",
  storageBucket: "pso-fp-development.firebasestorage.app",
  messagingSenderId: "128319164432",
  appId: "1:128319164432:web:92ca395dbbfbfdfd287a95",
  measurementId: "G-Z7HTWR8CPS",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

const ERROR_MESSAGES = {
  "auth/wrong-password": "Password salah",
  "auth/email-already-in-use": "Email sudah digunakan",
  "auth/user-not-found": "Akun tidak ditemukan",
};

const mapFirebaseError = (error) => {
  if (!error) return "Terjadi kesalahan";
  return ERROR_MESSAGES[error.code] || error.message || "Terjadi kesalahan";
};

export const signIn = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw mapFirebaseError(error);
  }
};

export const signUp = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw mapFirebaseError(error);
  }
};
