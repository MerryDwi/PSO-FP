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
  // Unified configuration for both production and development
  const unifiedConfig = {
    apiKey: "AIzaSyBRQaEYKS-erNIpHYkztQ60sJ8dpSO3eVE",
    authDomain: "pso-fp-development.firebaseapp.com",
    projectId: "pso-fp-development",
    storageBucket: "pso-fp-development.firebasestorage.app",
    messagingSenderId: "128319164432",
    appId: "1:128319164432:web:92ca395dbbfbfdfd287a95",
    measurementId: "G-Z7HTWR8CPS",
  };

  // Allow overrides via env vars if provided (optional)
  const config = {
    apiKey:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_API_KEY) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY) ||
      unifiedConfig.apiKey,
    authDomain:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
      unifiedConfig.authDomain,
    projectId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_PROJECT_ID) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_PROJECT_ID) ||
      unifiedConfig.projectId,
    storageBucket:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
      unifiedConfig.storageBucket,
    messagingSenderId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
      unifiedConfig.messagingSenderId,
    appId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_APP_ID) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_APP_ID) ||
      unifiedConfig.appId,
    measurementId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
      unifiedConfig.measurementId,
  };

  if (typeof console !== "undefined") {
    console.log("🔧 Environment:", env);
    console.log("🔧 Firebase Project:", config.projectId);
  }

  return config;
};
