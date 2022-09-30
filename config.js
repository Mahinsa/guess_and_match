import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

let config = {
  apiKey: "AIzaSyDMbCM6ORoYYQVZoWYxVySFBw3hWMCIVb8",
  authDomain: "guessandmatch.firebaseapp.com",
  projectId: "guessandmatch",
  storageBucket: "guessandmatch.appspot.com",
  messagingSenderId: "1077522634939",
  appId: "1:1077522634939:web:40219d75992ea8e607719e",
  measurementId: "G-QHGBKG90FL",
};

const app = initializeApp(config);
app.initializeApp();
