import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCl7f50tcPVI9CPAshUYqRh4TfDKgScWu0",
  authDomain: "react-final-project-655ec.firebaseapp.com",
  projectId: "react-final-project-655ec",
  storageBucket: "react-final-project-655ec.firebasestorage.app",
  messagingSenderId: "711132203193",
  appId: "1:711132203193:web:d9dc6c19f8f02a052fb368",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
