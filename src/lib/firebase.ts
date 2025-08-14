// Import statements would be here in a real app
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "healthlink-iymsz",
  "appId": "1:87432400493:web:14845235939d74a2e77964",
  "storageBucket": "healthlink-iymsz.appspot.com",
  "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  "authDomain": "healthlink-iymsz.firebaseapp.com",
  "messagingSenderId": "87432400493",
  "measurementId": ""
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// In a real app, you would export these initialized services.
export { app, auth, db, storage };
