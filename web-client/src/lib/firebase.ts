import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCjyL4W7ZdpjUqbDyk-h6hF8iKi5kAeDMI",
    authDomain: "typeabc-f91aa.firebaseapp.com",
    databaseURL: "https://typeabc-f91aa-default-rtdb.firebaseio.com",
    projectId: "typeabc-f91aa",
    storageBucket: "typeabc-f91aa.appspot.com",
    messagingSenderId: "631452791937",
    appId: "1:631452791937:web:e9666f084661dd99054980",
    measurementId: "G-K6Z0ZFLB3E"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

export { database };
