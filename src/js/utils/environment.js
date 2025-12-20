// ===============================
// ENVIRONMENT UTILITIES (SAFE VERSION)
// ===============================

/**
 * Load env variable safely
 */
const loadEnv = (key, fallback = "") => {
  try {
    if (typeof window !== "undefined" && window.env && window.env[key]) {
      return window.env[key];
    }
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
    return fallback;
  } catch (error) {
    throw new Error(
      `Failed to load environment variable: ${key} - ${error.message}`
    );
  }
};

/**
 * Determine environment
 */
export const getEnvironment = () => {
  try {
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
  } catch (error) {
    throw new Error(`Failed to determine environment: ${error.message}`);
  }
};

export const isProduction = () => {
  try {
    return getEnvironment() === "production";
  } catch (error) {
    throw new Error(`Failed to check production mode: ${error.message}`);
  }
};

export const isDevelopment = () => {
  try {
    return getEnvironment() === "development";
  } catch (error) {
    throw new Error(`Failed to check development mode: ${error.message}`);
  }
};

/**
 * Get Firebase config based fully on .env variables
 * Falls back to development config if env vars are not set
 */
export const getFirebaseConfig = () => {
  try {
    // Default Firebase configuration (development)
    const defaultConfig = {
      apiKey: "AIzaSyBRQaEYKS-erNIpHYkztQ60sJ8dpSO3eVE",
      authDomain: "pso-fp-development.firebaseapp.com",
      projectId: "pso-fp-development",
      storageBucket: "pso-fp-development.firebasestorage.app",
      messagingSenderId: "128319164432",
      appId: "1:128319164432:web:92ca395dbbfbfdfd287a95",
      measurementId: "G-Z7HTWR8CPS",
    };

    return {
      apiKey: loadEnv("VITE_FIREBASE_API_KEY", defaultConfig.apiKey),
      authDomain: loadEnv(
        "VITE_FIREBASE_AUTH_DOMAIN",
        defaultConfig.authDomain
      ),
      projectId: loadEnv("VITE_FIREBASE_PROJECT_ID", defaultConfig.projectId),
      storageBucket: loadEnv(
        "VITE_FIREBASE_STORAGE_BUCKET",
        defaultConfig.storageBucket
      ),
      messagingSenderId: loadEnv(
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        defaultConfig.messagingSenderId
      ),
      appId: loadEnv("VITE_FIREBASE_APP_ID", defaultConfig.appId),
      measurementId: loadEnv(
        "VITE_FIREBASE_MEASUREMENT_ID",
        defaultConfig.measurementId
      ),
    };
  } catch (error) {
    throw new Error(`Failed to get Firebase config: ${error.message}`);
  }
};
