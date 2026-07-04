import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA9cAOCHAmVFYBEjGL1IlJEXaweREV0GfY",
  authDomain: "testing-1a3f6.firebaseapp.com",
  projectId: "testing-1a3f6",
  storageBucket: "testing-1a3f6.firebasestorage.app",
  messagingSenderId: "377594262331",
  appId: "1:377594262331:web:fc41692a34e9daca4d3d1e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
  const email = "dyhard108@sash.in";
  const password = "password123"; // default password

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Firebase user created successfully!");
    console.log("User ID:", userCredential.user.uid);
    console.log("Email:", userCredential.user.email);
    console.log("Password: password123");
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User ${email} already exists in Firebase Auth.`);
      process.exit(0);
    }
    console.error("Error creating user:", error.message);
    process.exit(1);
  }
}

createAdmin();
