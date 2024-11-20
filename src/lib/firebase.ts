import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDl4bFaVJDiXELyl78cKNzo3vUDaHrM6ms",
    authDomain: "crossword---copie.firebaseapp.com",
    projectId: "crossword---copie",
    storageBucket: "crossword---copie.firebasestorage.app",
    messagingSenderId: "866214959651",
    appId: "1:866214959651:web:5c0837a2186b2862c2af96",
    measurementId: "G-8TE93CTPJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app; 