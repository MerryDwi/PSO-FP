// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXw-mEwyjH9qA5W8jM5W3zSwbXqMhRk",
  authDomain: "pso-fp-aci5ba.firebaseapp.com",
  projectId: "pso-fp-aci5ba",
  storageBucket: "pso-fp-aci5ba.appspot.com",
  messagingSenderId: "574242918850",
  appId: "1:574242918850:web:5ab90f7ac913323867",
  measurementId: "G-JNZL6N4L3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);