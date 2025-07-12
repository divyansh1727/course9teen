// src/lib/getUserFromFirestore.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getUserFromFirestore = async (clerkUserId) => {
  const userRef = doc(db, "users", clerkUserId);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data(); // returns { name, email, imageUrl, ... }
  } else {
    console.warn("User not found in Firestore");
    return null;
  }
};
