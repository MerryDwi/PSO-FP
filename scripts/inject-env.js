#!/usr/bin/env node

/**
 * Script untuk inject environment variables ke HTML
 * Digunakan untuk static HTML projects yang tidak menggunakan build tool
 *
 * Usage: node scripts/inject-env.js <input.html> <output.html>
 */

const fs = require("fs");
const path = require("path");

// Get environment variables
const env = process.env.VITE_ENV || process.env.NODE_ENV || "development";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.VITE_FIREBASE_APP_ID || "",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Create window.env object
const envScript = `
  <script>
    window.env = {
      VITE_ENV: "${env}",
      VITE_FIREBASE_API_KEY: "${firebaseConfig.apiKey}",
      VITE_FIREBASE_AUTH_DOMAIN: "${firebaseConfig.authDomain}",
      VITE_FIREBASE_PROJECT_ID: "${firebaseConfig.projectId}",
      VITE_FIREBASE_STORAGE_BUCKET: "${firebaseConfig.storageBucket}",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "${firebaseConfig.messagingSenderId}",
      VITE_FIREBASE_APP_ID: "${firebaseConfig.appId}",
      VITE_FIREBASE_MEASUREMENT_ID: "${firebaseConfig.measurementId}",
    };
  </script>
`;

// Read input file
const inputFile = process.argv[2] || "index.html";
const outputFile = process.argv[3] || inputFile;

try {
  let html = fs.readFileSync(inputFile, "utf8");

  // Check if window.env already exists
  if (html.includes("window.env")) {
    // Replace existing window.env
    html = html.replace(
      /<script>[\s\S]*?window\.env[\s\S]*?<\/script>/,
      envScript.trim()
    );
  } else {
    // Inject before closing </head> tag
    if (html.includes("</head>")) {
      html = html.replace("</head>", `${envScript}</head>`);
    } else if (html.includes("<body>")) {
      // If no </head>, inject before <body>
      html = html.replace("<body>", `${envScript}<body>`);
    } else {
      // If no </head> or <body>, inject at the beginning
      html = envScript + html;
    }
  }

  // Write output file
  fs.writeFileSync(outputFile, html, "utf8");
  console.log(`✅ Environment variables injected to ${outputFile}`);
  console.log(`   Environment: ${env}`);
  console.log(`   Firebase Project: ${firebaseConfig.projectId || "not set"}`);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
