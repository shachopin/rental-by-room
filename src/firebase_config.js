import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBosH5qLuqvSkvYuvnzqDlxfWJPbAZ8L0I",
  authDomain: "rental-by-room.firebaseapp.com",
  projectId: "rental-by-room",
  storageBucket: "rental-by-room.appspot.com",
  messagingSenderId: "245863296508",
  appId: "1:245863296508:web:17c8011183933a01bf9679"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

export { db };