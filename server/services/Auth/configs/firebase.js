import { cert, initializeApp } from "firebase-admin";

import firebaseService from "../firebaseService.json" with { type: "json" };

export const firebaseApp = initializeApp({
  credential: cert(firebaseService),
});
