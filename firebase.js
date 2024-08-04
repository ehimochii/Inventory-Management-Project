// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnnJLXcrCKJbiNsLaCb60oPeqyf4dJ_SQ",
  authDomain: "pantryproject-1c8b7.firebaseapp.com",
  projectId: "pantryproject-1c8b7",
  storageBucket: "pantryproject-1c8b7.appspot.com",
  messagingSenderId: "675573862497",
  appId: "1:675573862497:web:dd5da2439a7efad35d5a20",
  measurementId: "G-G3RV8QFMDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};
