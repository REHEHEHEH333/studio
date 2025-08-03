import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMwPiKa1QtFfefKkpiXTKvLcOGhnkeaSU",
  authDomain: "responseready-mdt.firebaseapp.com",
  projectId: "responseready-mdt",
  storageBucket: "responseready-mdt.firebasestorage.app",
  messagingSenderId: "470276407978",
  appId: "1:470276407978:web:40d1f8a80473821c3e06d3",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
