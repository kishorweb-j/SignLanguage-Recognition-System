# Firebase setup

1. Create a Firebase project.
2. Add a Web App.
3. Copy the Web SDK config into `frontend/js/firebase-config.js`.
4. Authentication -> Sign-in method -> enable Email/Password.
5. Firestore Database -> Create database.
6. Publish `firestore.rules`.
7. Storage -> Get started if you need gesture images.

Collections:
- users/{uid}: name, email, createdAt
- history/{auto-id}: uid, label, confidence, fingerCount, createdAt
- gestures/{gesture-id}: label, description, imageUrl, featureData

Do not put a Firebase Admin SDK private key in frontend code.
