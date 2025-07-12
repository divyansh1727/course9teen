import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyASP-VSCSugD9EjwUR884Tdh-_tgiYiHLE",
  authDomain: "coursesell-bcbf6.firebaseapp.com",
  projectId: "coursesell-bcbf6",
  storageBucket: "coursesell-bcbf6.firebasestorage.app",
  messagingSenderId: "276220310838",
  appId: "1:276220310838:web:5770d9c64d27f66cdeef97"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);