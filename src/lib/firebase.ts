import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, type Auth } from "firebase/auth";

// Firebase web config is not a secret — it's meant to be public in client bundles.
// The Realtime Database security rules are the actual boundary (see database.rules.json).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Lazy init: getDatabase() parses databaseURL immediately and throws if it's missing/
// invalid. Next's static export still evaluates client components once during the
// build to produce the initial HTML, so top-level `getDatabase()` would crash the build
// whenever NEXT_PUBLIC_FIREBASE_DATABASE_URL isn't set yet — deferring to first actual
// use (in the browser, inside a hook's useEffect) avoids that.
let app: FirebaseApp | undefined;
let dbInstance: Database | undefined;
let authInstance: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Database {
  if (!dbInstance) {
    dbInstance = getDatabase(getFirebaseApp());
  }
  return dbInstance;
}

export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}
