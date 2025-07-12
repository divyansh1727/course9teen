// src/lib/saveUserToFirestore.js
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const saveUserToFirestore = async (user) => {
  const userRef = doc(db, "users", user.id);

  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      name: user.fullName,
      email: user.primaryEmailAddress.emailAddress,
      imageUrl: user.imageUrl,
      createdAt: new Date(),
    });
    console.log("✅ User saved to Firestore");
  } else {
    console.log("ℹ️ User already exists in Firestore");
  }
};
