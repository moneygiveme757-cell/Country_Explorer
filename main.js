import { auth, db } from "./firebase.js";

import { signOut }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { patchCountry } from "./countryDataPatch.js";
const countriesContainer =
document.getElementById("countriesContainer");

const detailsContent =
document.getElementById("detailsContent");

const searchInput =
document.getElementById("searchInput");

const regionFilter =
document.getElementById("regionFilter");

const sortSelect =
document.getElementById("sortSelect");

let allCountries = [];

// ======================
// LEAFLET MAP
// ======================

const map = L.map("map").setView([20, 0], 2);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "© OpenStreetMap contributors"
  }
).addTo(map);

let marker;

// ======================
// LOAD COUNTRIES
// ======================

async function loadCountries() {
    try {

        const response = await fetch("./data/countries.json");

        if (!response.ok) {
            throw new Error("Unable to load countries.");
        }

        const data = await response.json();

        allCountries = data.map(country => patchCountry({
            name: {
                common: country.name.common
            },

            flags: {
              png:
                country.flags?.png ||
                `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`
            },

            population: country.population || 0,

            region: country.region || "",

            capital: country.capital || [],

            area: country.area || 0,

            languages: country.languages || {},

            timezones: country.timezones || [],

            latlng: country.latlng || [],

            borders: country.borders || [],

            currencies: country.currencies || {}
        })
    );
        console.log(allCountries[0]);
        renderCountries(allCountries);

    } catch (error) {

        console.error(error);

        countriesContainer.innerHTML =
            "<h2>Failed to load countries.</h2>";

    }
}

// ======================
// RENDER COUNTRY CARDS
// ======================

function renderCountries(countries) {

  countriesContainer.innerHTML = "";

  countries.forEach(country => {

    const card = document.createElement("div");

    card.className = "country-card";

    card.innerHTML = `
      <img src="${country.flags?.png || ""}">

      <div class="country-content">

        <h3>${country.name?.common || "Unknown"}</h3>

        <p>
          Population:
          ${(country.population || 0).toLocaleString()}
        </p>

        <p>
          Region:
          ${country.region || "N/A"}
        </p>

        <button class="details-btn">
          View Details
        </button>

        <button class="favorite-btn">
          Save Favorite
        </button>

      </div>
    `;

    const detailsBtn =
      card.querySelector(".details-btn");

    const favoriteBtn =
      card.querySelector(".favorite-btn");

    detailsBtn.addEventListener("click", () => {
      showCountryDetails(country);
    });

    favoriteBtn.addEventListener("click", () => {
      saveFavorite(country);;
    });

    countriesContainer.appendChild(card);

  });

}
async function saveFavorite(country) {

  if(localStorage.getItem("guest")){
    alert("Guests cannot save favorites.");
    return;
  }

  const user = auth.currentUser;

  if(!user){
    alert("Please login.");
    return;
  }

  try{

    await setDoc(
      doc(
        db,
        "favorites",
        `${user.uid}_${country.name.common}`
      ),
      {
        name: country.name.common,
        flag: country.flags.png,
        region: country.region,
        population: country.population
      }
    );

    alert("Favorite saved!");

  }catch(error){

    console.error(error);

  }

}
// ======================
// SEARCH / FILTER / SORT
// ======================

function filterCountries() {

  let filtered = [...allCountries];

  const search =
    searchInput.value.toLowerCase();

  const region =
    regionFilter.value;

  const sort =
    sortSelect.value;

  // SEARCH
  filtered = filtered.filter(country =>
    country.name.common
      .toLowerCase()
      .includes(search)
  );

  // REGION FILTER
  if (region) {

    filtered = filtered.filter(country =>
      country.region === region
    );

  }

  // SORTING
  if (sort === "name") {

    filtered.sort((a, b) =>
      a.name.common.localeCompare(
        b.name.common
      )
    );

  }

  if (sort === "population") {

    filtered.sort((a, b) =>
      b.population - a.population
    );

  }

  if (sort === "area") {

    filtered.sort((a, b) =>
      b.area - a.area
    );

  }

  renderCountries(filtered);

}

// ======================
// EVENT LISTENERS
// ======================

searchInput.addEventListener(
  "input",
  filterCountries
);

regionFilter.addEventListener(
  "change",
  filterCountries
);

sortSelect.addEventListener(
  "change",
  filterCountries
);

// LOGOUT
document.getElementById("logoutBtn")
  .addEventListener("click", async () => {

    localStorage.removeItem("guest");

    try {
      await signOut(auth);
    } catch (error) {}

    window.location.href = "index.html";

  });

// MAP CLICK
map.on("click", function (e) {

  const lat = e.latlng.lat.toFixed(2);
  const lng = e.latlng.lng.toFixed(2);

  L.popup()
    .setLatLng(e.latlng)
    .setContent(
      `Coordinates:<br>${lat}, ${lng}`
    )
    .openOn(map);

});
async function showCountryDetails(country) {

  try {

    const lat =
      country.latlng?.[0] || 0;

    const lng =
      country.latlng?.[1] || 0;

    let weatherHTML = "<p>No weather data.</p>";

    if (country.latlng) {

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );

      const weatherData =
        await weatherResponse.json();

      weatherHTML = `
        <h3>Live Weather</h3>

        <p>
          Temperature:
          ${weatherData.current_weather?.temperature ?? "N/A"}°C
        </p>

        <p>
          Wind Speed:
          ${weatherData.current_weather?.windspeed ?? "N/A"} km/h
        </p>
      `;
    }

    detailsContent.innerHTML = `
      <img
        src="${country.flags?.png || ""}"
        width="220"
      >

      <h2>${country.name?.common || "Unknown"}</h2>

      <p>
        <strong>Capital:</strong>
        ${country.capital?.[0] || "N/A"}
      </p>

      <p>
        <strong>Population:</strong>
        ${(country.population || 0).toLocaleString()}
      </p>

      <p>
        <strong>Area:</strong>
        ${country.area || "N/A"} km²
      </p>

      <p>
        <strong>Languages:</strong>
        ${
          country.languages
            ? Object.values(country.languages).join(", ")
            : "N/A"
        }
      </p>

      <p>
        <strong>Timezones:</strong>
        ${
          country.timezones
            ? country.timezones.join(", ")
            : "N/A"
        }
      </p>

      <hr>

      ${weatherHTML}
    `;

    if (country.latlng) {

      map.setView([lat, lng], 5);

      if (marker) {
        marker.remove();
      }

      marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(country.name.common)
        .openPopup();
    }

  } catch (error) {

    console.error("Details error:", error);

  }

}
// ======================
// START APP
// ======================

loadCountries();