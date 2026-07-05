import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const container =
document.getElementById("favoritesContainer");

// WAIT FOR FIREBASE AUTH
onAuthStateChanged(auth, async (user) => {

  // GUEST MODE
  if(localStorage.getItem("guest")){

    container.innerHTML =
    "<h2>Guests cannot use favorites.</h2>";

    return;
  }

  // NOT LOGGED IN
  if(!user){

    container.innerHTML =
    "<h2>Please login first.</h2>";

    return;
  }

  // LOAD FAVORITES
  loadFavorites(user);

});

async function loadFavorites(user){

  try{

    container.innerHTML = "";

    const snapshot =
    await getDocs(collection(db, "favorites"));

    snapshot.forEach((documentData) => {

      // ONLY THIS USER'S FAVORITES
      if(
        !documentData.id.startsWith(user.uid)
      ){
        return;
      }

      const data =
      documentData.data();

      const card =
      document.createElement("div");

      card.className = "favorite-card";

      card.innerHTML = `
        <img src="${data.flag}">

        <h2>${data.name}</h2>

        <p>
          Region:
          ${data.region}
        </p>

        <p>
          Population:
          ${data.population.toLocaleString()}
        </p>

        <button class="remove-btn">
          Remove Favorite
        </button>
      `;

      // REMOVE FAVORITE
      card.querySelector(".remove-btn")
      .addEventListener("click", async () => {

        try{

          await deleteDoc(
            doc(
              db,
              "favorites",
              documentData.id
            )
          );

          card.remove();

        }catch(error){

          console.error(error);

        }

      });

      container.appendChild(card);

    });

  }catch(error){

    console.error(
      "Favorites loading error:",
      error
    );

  }

}