/**
 * @file firebase.js
 * @description Initializes Firebase Admin SDK for hybrid email verification.
 */

import admin from "firebase-admin";

const initFirebase = () => {
  try {
    // Only initialize if we have the necessary env variables
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn("⚠️  Firebase Admin SDK not initialized: FIREBASE_PROJECT_ID missing");
      return null;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines from .env string
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅  Firebase Admin SDK initialized.");
    }
    return admin;
  } catch (error) {
    console.error("❌  Firebase Admin init error:", error.message);
    return null;
  }
};

export const firebaseAdmin = initFirebase();
export default firebaseAdmin;
