"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "brainduel-yn3lz",
  "appId": "1:1057572508230:web:436702358e777afe463047",
  "storageBucket": "brainduel-yn3lz.firebasestorage.app",
  "apiKey": "AIzaSyB2FwIHL1aX3rnrq6j9XjckaxGwQgKMoc4",
  "authDomain": "brainduel-yn3lz.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1057572508230"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
