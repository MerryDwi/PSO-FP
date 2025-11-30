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
    // Vercel preview URLs biasanya mengandung branch name atau hash
    if (hostname.includes("vercel.app") && !hostname.includes("pso-fp-prod")) {
      return "development";
    }
    // Production domain
    if (
      hostname.includes("pso-fp-prod") ||
      hostname === "your-production-domain.com"
    ) {
      return "production";
    }
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
    apiKey: "AIzaSyCXw-mEwyjH9qA5W8jM5W3zSwbXqMhRk",
    authDomain: "pso-fp-aci5ba.firebaseapp.com",
    projectId: "pso-fp-aci5ba",
    storageBucket: "pso-fp-aci5ba.appspot.com",
    messagingSenderId: "574242918850",
    appId: "1:574242918850:web:5ab90f7ac913323867",
    measurementId: "G-JNZL6N4L3S",
  };

  // Development config (override via window.env atau environment variables)
  const developmentConfig = {
    apiKey:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_API_KEY) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_API_KEY) ||
      productionConfig.apiKey, // Fallback to production if not set
    authDomain:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
      productionConfig.authDomain,
    projectId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_PROJECT_ID) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_PROJECT_ID) ||
      productionConfig.projectId,
    storageBucket:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
      productionConfig.storageBucket,
    messagingSenderId:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
      productionConfig.messagingSenderId,
    appId:
      (typeof window !== "undefined" && window.env?.VITE_FIREBASE_APP_ID) ||
      (typeof process !== "undefined" && process.env?.VITE_FIREBASE_APP_ID) ||
      productionConfig.appId,
    measurementId:
      (typeof window !== "undefined" &&
        window.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
      (typeof process !== "undefined" &&
        process.env?.VITE_FIREBASE_MEASUREMENT_ID) ||
      productionConfig.measurementId,
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
