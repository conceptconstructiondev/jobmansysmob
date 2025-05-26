import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbcMR5umfRcimDiTeoXzV7_FMoYO6RbWk",
  authDomain: "conceptjobapp-bebb9.firebaseapp.com",
  projectId: "conceptjobapp-bebb9",
  storageBucket: "conceptjobapp-bebb9.firebasestorage.app",
  messagingSenderId: "300633467159",
  appId: "1:300633467159:web:22a09686f2ede1a9492f52",
  measurementId: "G-4W6JN5XP03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app; 