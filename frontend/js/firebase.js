import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    firebaseConfig,
    firebaseReady
} from "./firebase-config.js";


/* =========================
   FIREBASE INITIALIZATION
========================= */

let app = null;
let auth = null;
let db = null;

if (firebaseReady) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}


/* =========================
   EXPORTS
========================= */

export {
    auth,
    db,
    firebaseReady,
    onAuthStateChanged,
    signOut
};


/* =========================
   REGISTER USER
========================= */

export async function registerUser(name, email, password) {

    if (!firebaseReady) {
        throw new Error("Firebase is not configured.");
    }

    const credential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    await updateProfile(
        credential.user,
        {
            displayName: name
        }
    );

    await setDoc(
        doc(db, "users", credential.user.uid),
        {
            name: name,
            email: email,
            createdAt: serverTimestamp()
        }
    );

    return credential.user;
}


/* =========================
   LOGIN USER
========================= */

export async function loginUser(email, password) {

    if (!firebaseReady) {
        throw new Error("Firebase is not configured.");
    }

    const credential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    return credential.user;
}


/* =========================
   SAVE RECOGNITION HISTORY
========================= */

export async function saveHistory(result) {

    if (!firebaseReady || !auth?.currentUser) {
        throw new Error(
            "Login is required to save history."
        );
    }

    await addDoc(
        collection(db, "history"),
        {
            uid: auth.currentUser.uid,
            label: result.label,
            confidence: result.confidence,
            fingerCount: result.finger_count ?? 0,
            createdAt: serverTimestamp()
        }
    );
}


/* =========================
   GET RECOGNITION HISTORY
========================= */

export async function getHistory() {

    if (!firebaseReady || !auth?.currentUser) {
        throw new Error(
            "Login is required to view history."
        );
    }

    /*
       IMPORTANT:
       We only filter by UID here.

       We do NOT use orderBy("createdAt")
       because that requires a Firestore
       composite index together with the UID filter.
    */

    const q = query(
        collection(db, "history"),
        where(
            "uid",
            "==",
            auth.currentUser.uid
        )
    );

    const snap = await getDocs(q);

    const history = snap.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
    }));


    /* =========================
       SORT NEWEST → OLDEST
    ========================= */

    history.sort((a, b) => {

        const timeA =
            a.createdAt?.toMillis?.() || 0;

        const timeB =
            b.createdAt?.toMillis?.() || 0;

        return timeB - timeA;
    });


    return history;
}