const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA9cAOCHAmVFYBEjGL1IlJEXaweREV0GfY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'testing-1a3f6.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'testing-1a3f6',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function run() {
  console.log("Logging in...");
  const credential = await signInWithEmailAndPassword(auth, "admin_master@sash.in", "password123");
  const token = await credential.user.getIdToken();
  console.log("Got token length:", token.length);

  // Send to local API
  const res = await fetch('http://localhost:3001/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token })
  });
  
  const cookies = res.headers.get('set-cookie');
  console.log("Cookie from session API:", cookies);

  // Try to access dashboard
  const res2 = await fetch('http://localhost:3001/admin/dashboard', {
    headers: {
      'Cookie': cookies
    },
    redirect: 'manual'
  });
  
  console.log("Dashboard response status:", res2.status);
  console.log("Dashboard redirect target:", res2.headers.get('location'));
}

run().catch(console.error);
