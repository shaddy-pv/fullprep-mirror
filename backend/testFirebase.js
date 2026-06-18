import "dotenv/config";
import { firebaseAdmin } from "./src/config/firebase.js";

if (firebaseAdmin) {
  console.log("FIREBASE_IS_WORKING");
} else {
  console.log("FIREBASE_FAILED");
}
