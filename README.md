# Sign Language Recognition & Voice Conversion System

College-project starter implementation using traditional computer vision (OpenCV), Flask, Firebase Authentication/Firestore, and browser Text-to-Speech.

## Flow
Webcam -> JavaScript -> Flask API -> OpenCV preprocessing -> feature extraction -> pattern matching -> text -> speech

## Setup
1. Install Python 3.10+.
2. Open PowerShell in this folder.
3. `python -m venv venv`
4. `.env\Scripts\Activate.ps1`
5. `pip install -r requirements.txt`
6. Put your Firebase Web App config in `frontend/js/firebase-config.js`.
7. Enable Firebase Authentication (Email/Password) and Firestore.
8. Run `python backend/app.py`.
9. Open `http://127.0.0.1:5000`.

## Demo recognition
The included non-AI engine uses a simple finger-count/rule matcher:
0=FIST, 1=ONE, 2=TWO, 3=THREE, 4=FOUR, 5=HELLO.
This is an educational baseline, not a complete sign-language model. For your final project, collect consistent gesture samples and extend the pattern database/rules.

## Firebase
Collections:
- users/{uid}
- history/{auto-id}
- gestures/{gesture-id}

Never put a Firebase Admin SDK private key in frontend code.
