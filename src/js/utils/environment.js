// ===============================
// ENVIRONMENT UTILITIES
// ===============================
// Helper functions untuk detect dan manage environment

/**
 * Get current environment
 * @returns {string} 'production' | 'development'
 */
export const getEnvironment = () => {
  // Check dari window.env (set via script tag atau Vercel)
  if (typeof window !== "undefined" && window.env) {
    return window.env.VITE_ENV || window.env.ENV || "development";
  }

  // Check dari URL (untuk Vercel preview deployments)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Localhost => development
    if (hostname === "localhost" || hostname.startsWith("127.") || hostname.endsWith(".local")) {
      return "development";
    }
    // Vercel environment detection: prefer preview as development
    if (hostname.endsWith("vercel.app")) {
      // If you have a dedicated production alias, add it here
      const PROD_ALIASES = ["fp-pso-umber.vercel.app", "pso-fp-prod.vercel.app", "your-production-domain.com"];
      if (PROD_ALIASES.includes(hostname)) {
        return "production";
      }
      return "development";
    }
    // Fallback: unknown host treated as production
    return "production";
  }

  // Default untuk Node.js/testing
  if (typeof process !== "undefined" && process.env) {
    return process.env.VITE_ENV || process.env.NODE_ENV || "development";
  }

  return "development";
};

/**
 * Check if running in production
 * @returns {boolean}
 */
export const isProduction = () => {
  return getEnvironment() === "production";
};

/**
 * Check if running in development
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return getEnvironment() === "development";
};

/**
 * Get Firebase config based on environment
 * @returns {Object} Firebase configuration object
 */
export const getFirebaseConfig = () => {
  const env = getEnvironment();
  const isProd = env === "production";

  // Production config (default)
  const productionConfig = {
    apiKey: "AIzaSyBzMp3CrtlSfDGwsivm_LZQsMYX8BW7Psk",
    authDomain: "pso-fp-ac58a.firebaseapp.com",
    projectId: "pso-fp-ac58a",
    storageBucket: "pso-fp-ac58a.firebasestorage.app",
    messagingSenderId: "571420318582",
    appId: "1:571420318582:web:96b907cefcda8013323857",
    measurementId: "G-JVZJ4BZ3E9",
  };

  // Development config (override via window.env atau environment variables)
  const developmentConfig = {
    apiKey:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_API_KEY) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY) ||
      "AIzaSyBRQaEYKS-erNIpHYkztQ60sJ8dpSO3eVE",
    authDomain:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
      "pso-fp-development.firebaseapp.com",
    projectId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_PROJECT_ID) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_PROJECT_ID) ||
      "pso-fp-development",
    storageBucket:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
      "pso-fp-development.firebasestorage.app",
    messagingSenderId:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
      "128319164432",
    appId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_APP_ID) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_APP_ID) ||
      "1:128319164432:web:92ca395dbbfbfdfd287a95",
    measurementId:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
      "G-Z7HTWR8CPS",
  };

  // Return config based on environment
  const config = isProd ? productionConfig : developmentConfig;

  // Log environment info (only in development)
  if (isDevelopment() && typeof console !== "undefined") {
    console.log("🔧 Environment:", env);
    console.log("🔧 Firebase Project:", config.projectId);
  }

  return config;
};
