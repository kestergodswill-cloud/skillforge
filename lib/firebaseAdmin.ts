import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

console.log("--- FIREBASE ADMIN DEBUG ---");
console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Found ✅" : "Missing ❌");
console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL ? "Found ✅" : "Missing ❌");
console.log("Private Key:", process.env.FIREBASE_PRIVATE_KEY ? "Found ✅" : "Missing ❌");
console.log("----------------------------");

const formattedKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
  : undefined;

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId:"skillforge-a836c", 
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey,
      }),
    });
    console.log("Firebase Admin Initialized Successfully! ✅");
  } catch (error) {
    console.error("Firebase Admin Initialization Failed ❌:", error);
  }
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();