// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirebaseConfig, getEnvironment } from "./utils/environment.js";

// Get Firebase configuration based on environment
// This will use production config by default, or development config
// if environment variables are set via window.env or process.env
export const firebaseConfig = getFirebaseConfig();

// Get current environment
export const environment = getEnvironment();

// Initialize Firebase (gunakan existing app jika sudah ada untuk avoid conflicts)
// This prevents errors if firestoreCRUD.js loads before this file
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app dan analytics untuk penggunaan di file lain
export { app, analytics };
