// Browser-friendly Firebase config provider
// Uses environment utils without importing Firebase npm SDK
import { getFirebaseConfig, getEnvironment } from "./utils/environment.js";

export const firebaseConfig = getFirebaseConfig();
export const environment = getEnvironment();
