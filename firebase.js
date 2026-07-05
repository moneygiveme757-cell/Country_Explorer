
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDo7TzC9CdGM_g8VUL_Ri-t8UJwUl36P4E",
  authDomain: "gajfn-13fff.firebaseapp.com",
  projectId: "gajfn-13fff",
  storageBucket: "gajfn-13fff.firebasestorage.app",
  messagingSenderId: "537615157194",
  appId: "1:537615157194:web:1b028992fc99542acbb133"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
