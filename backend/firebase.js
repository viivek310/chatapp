// firebaseService.js

// firebaseService.js

import admin from 'firebase-admin';
import serviceAccount from './config/serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

export { messaging };
