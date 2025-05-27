import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Better approach with environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDbcMR5umfRcimDiTeoXzV7_FMoYO6RbWk",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "conceptjobapp-bebb9.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "conceptjobapp-bebb9",
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
const storage = getStorage(app);

// Notification token management functions
export async function saveNotificationToken(userId: string, token: string) {
  try {
    await setDoc(doc(db, 'notificationTokens', userId), {
      token,
      userId,
      updatedAt: Timestamp.now(),
      platform: 'expo'
    });
    console.log('Notification token saved successfully');
  } catch (error) {
    console.error('Error saving notification token:', error);
    throw error;
  }
}

export async function removeNotificationToken(userId: string) {
  try {
    await deleteDoc(doc(db, 'notificationTokens', userId));
    console.log('Notification token removed successfully');
  } catch (error) {
    console.error('Error removing notification token:', error);
    throw error;
  }
}

export async function logNotification(userId: string, title: string, body: string, data?: any) {
  try {
    await addDoc(collection(db, 'notificationLogs'), {
      userId,
      title,
      body,
      data,
      sentAt: Timestamp.now(),
      platform: 'expo'
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

export { auth, db, storage };
export default app; 