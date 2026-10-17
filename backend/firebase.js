import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let messagingInstance = null;

try {
  const localKeyPath = path.resolve(__dirname, './config/serviceAccountKey.json');
  
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    messagingInstance = admin.messaging();
    console.log('[Firebase] Initialized with environment credentials.');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(creds),
    });
    messagingInstance = admin.messaging();
    console.log('[Firebase] Initialized with FIREBASE_SERVICE_ACCOUNT_JSON.');
  } else if (fs.existsSync(localKeyPath)) {
    const rawData = fs.readFileSync(localKeyPath, 'utf8');
    const creds = JSON.parse(rawData);
    admin.initializeApp({
      credential: admin.credential.cert(creds),
    });
    messagingInstance = admin.messaging();
    console.log('[Firebase] Initialized with local serviceAccountKey.json.');
  } else {
    console.warn('[Firebase] No credentials found. Push notifications will be safely disabled.');
  }
} catch (error) {
  console.warn('[Firebase] Initialization skipped or failed:', error.message);
}

// Fallback stub if Firebase is unconfigured so app doesn't crash
const messaging = messagingInstance || {
  send: async () => {
    console.warn('[Firebase] Notification skipped: Firebase is not configured.');
    return { success: false, message: 'Firebase not configured' };
  },
};

export { messaging };
