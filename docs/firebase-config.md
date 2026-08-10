# Firebase configuration and initialization for the web app

## General config
```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA60k3p3cSkqhZ6vibLzM178jHucToNKgk",
  authDomain: "rushoff2026.firebaseapp.com",
  projectId: "rushoff2026",
  storageBucket: "rushoff2026.firebasestorage.app",
  messagingSenderId: "473868365531",
  appId: "1:473868365531:web:6350395ef3b063898ee6fe",
  measurementId: "G-X5LMW3H90L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

## Realtime Database config
```
https://rushoff2026-default-rtdb.firebaseio.com/
```