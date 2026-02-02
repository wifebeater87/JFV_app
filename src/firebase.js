// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR CONFIG HERE (From Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyA4mk3ZxQ6dE9kNmV3YlAWxyu-dXrVvsYI",
  authDomain: "forest-valley-prototype.firebaseapp.com",
  projectId: "forest-valley-prototype",
  storageBucket: "forest-valley-prototype.firebasestorage.app",
  messagingSenderId: "189869365178",
  appId: "1:189869365178:web:cdab8905fef91c230daf83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };