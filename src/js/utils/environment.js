// ===============================
// ENVIRONMENT UTILITIES (SAFE VERSION)
// ===============================

/**
 * Load env variable safely
 */
const loadEnv = (key, fallback = "") => {
  if (typeof window !== "undefined" && window.env && window.env[key]) {
    return window.env[key];
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

/**
 * Determine environment
 */
export const getEnvironment = () => {
  if (typeof process !== "undefined" && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname.includes("127.")) {
      return "development";
    }
    return "production";
  }
  return "development";
};

export const isProduction = () => getEnvironment() === "production";
export const isDevelopment = () => getEnvironment() === "development";

/**
 * Get Firebase config based fully on .env variables
 */
export const getFirebaseConfig = () => {
  return {
    apiKey: loadEnv("VITE_FIREBASE_API_KEY"),
    authDomain: loadEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: loadEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: loadEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: loadEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: loadEnv("VITE_FIREBASE_APP_ID"),
    measurementId: loadEnv("VITE_FIREBASE_MEASUREMENT_ID"),
  };
};
