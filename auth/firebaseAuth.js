import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXw-mEwyjH9qA5W8jM5W3zSwbXqMhRk",
  authDomain: "pso-fp-aci5ba.firebaseapp.com",
  projectId: "pso-fp-aci5ba",
  storageBucket: "pso-fp-aci5ba.appspot.com",
  messagingSenderId: "574242918850",
  appId: "1:574242918850:web:5ab90f7ac913323867",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
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

