import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAd-4euttMAoLaCELK2yll32RL8LTcPWbw",
  authDomain: "crede-166c2.firebaseapp.com",
  databaseURL: "https://crede-166c2-default-rtdb.firebaseio.com",
  projectId: "crede-166c2",
  storageBucket: "crede-166c2.firebasestorage.app",
  messagingSenderId: "293908406435",
  appId: "1:293908406435:web:7fb818a16dd6196285df16",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const rtdb = getDatabase(app);
export const DB_ROOT = 'sefor3';
