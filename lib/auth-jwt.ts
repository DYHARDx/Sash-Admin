import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export interface FirebaseTokenPayload {
  name?: string;
  picture?: string;
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  firebase: {
    identities: {
      [key: string]: string[];
    };
    sign_in_provider: string;
  };
}

export async function verifyFirebaseToken(token: string): Promise<FirebaseTokenPayload | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'testing-1a3f6';
  if (!projectId) {
    console.error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined in environment variables.");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return payload as unknown as FirebaseTokenPayload;
  } catch (error) {
    console.error("Firebase token validation failed:", error);
    return null;
  }
}
