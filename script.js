// Google Maps API Starter
let map;
let currentBuilding;
let overlays = [];
let score = 0;
let gameOver = false;
const ACCEPTABLE_DISTANCE = 70;
//Building Data FEATURE
const buildings = [
  { name: "Sierra Hall", lat: 34.23830812788065, lng: -118.53104201608687},
  { name: "Jacaranda Hall", 34.24119682016486, lng: -118.5289230914783},
  { name: "Bookstore", lat: 34.2378, lng: -118.5276 },
  { name: "Maple hall", lat: 34.23769149296919, lng: -118.53127097040351 },
  { name: "Nordhoff Hall", lat: 34.23628685876091, lng: -118.53057123984614},
  { name: "Chaparral Hall", lat:34.23836746749, lng: -118.52711829602815},
  { name: "Library", lat: 34.24009760346545, lng: -118.52933063419128},
  { name: "Sustainability Center", lat: 34.2410, lng: -118.5266 }
];
// Map Initialization FEATURE
function initMap() {

  //  MapOptions FEATURE (explicit requirement)
  //  LatLng FEATURE (explicit requirement)
  const mapOptions = {
    center: new google.maps.LatLng(34.239, -118.53), // LatLng FEATURE
    zoom: 17,
    //disabling UI and interactions for a more game-like experience
    disableDefaultUI: true,
    gestureHandling: "greedy",
    clickableIcons: false,
    disableDoubleClickZoom: true,
    // Custom map styles to hide labels and points of interest
    styles: [
      {
        featureType: "all",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "poi",
        elementType: "all",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "transit",
        elementType: "all",
        stylers: [{ visibility: "off" }]
      }
    ]
  };
  // Map FEATURE
  map = new google.maps.Map(
    document.getElementById("map"),
    mapOptions
  );
  // Click event listener to handle user guesses
// Double-click event listener to handle user guesses
map.addListener("dblclick", (event) => {
  if (gameOver) return;

  // Prevent Google Maps default zoom on double click
  event.stop();

  handleGuess(event.latLng);
});
  //
  loadLeaderboard();
  startRound();
}
// Game Logic FEATURE
function startRound() {
// Clear previous round's markers and overlays
  clearMap();
// Randomly select a building for the player to find
  currentBuilding =
    buildings[Math.floor(Math.random() * buildings.length)];
// Display the building name as a clue
  document.getElementById("message").innerHTML = `
    Find:<br><br>
    <strong>${currentBuilding.name}</strong>
  `;
}
// Handle user's guess when they click on the map
function handleGuess(latLng) {
// Get the latitude and longitude of the user's guess
  const guessLat = latLng.lat();
  const guessLng = latLng.lng();
// Place a marker at the user's guess
  const guessMarker = new google.maps.Marker({
    position: { lat: guessLat, lng: guessLng },
    map: map
  });
  overlays.push(guessMarker);
// Calculate the distance between the guess and the actual building
  const distance = getDistanceMeters(
    guessLat,
    guessLng,
    currentBuilding.lat,
    currentBuilding.lng
  );
// Draw a circle around the actual building to show the acceptable area
  const circle = new google.maps.Circle({
    strokeColor: "#00ff00",
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: "#00ff00",
    fillOpacity: 0.25,
    map: map,
    center: {
      lat: currentBuilding.lat,
      lng: currentBuilding.lng
    },
    radius: ACCEPTABLE_DISTANCE
  });
  // Add the circle to the overlays array so it can be cleared later
  overlays.push(circle);
// Check if the user's guess is within the acceptable distance
  if (distance <= ACCEPTABLE_DISTANCE) {

    score++;
    document.getElementById("score-value").textContent = score;

    document.getElementById("message").innerHTML = `
      ✅ Correct!<br>
      ${Math.round(distance)} meters away
    `;

    setTimeout(startRound, 1500);

  } else {

    gameOver = true;
// Place a marker at the correct location
    const correctMarker = new google.maps.Marker({
      position: {
        lat: currentBuilding.lat,
        lng: currentBuilding.lng
      },
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "red",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "white"
      }
    });
// Add the correct marker to the overlays array so it can be cleared later
    overlays.push(correctMarker);
// Draw a line from the user's guess to the correct location
    const line = new google.maps.Polyline({
      // Define the path for the line using the user's guess and the correct building location
      path: [
        { lat: guessLat, lng: guessLng },
        { lat: currentBuilding.lat, lng: currentBuilding.lng }
      ],
      geodesic: true,
      strokeColor: "#ff0000",
      strokeWeight: 3,
      map: map
    });

    overlays.push(line);
// Pan and zoom the map to show the correct location and the user's guess
    map.panTo({
      lat: currentBuilding.lat,
      lng: currentBuilding.lng
    });

    map.setZoom(18);
// Display the final score and correct location
    document.getElementById("message").innerHTML = `
      ❌ Wrong Location<br><br>

      Correct Building:<br>
      <strong>${currentBuilding.name}</strong><br><br>

      You were:<br>
      <strong>${Math.round(distance)} meters away</strong><br><br>

      Final Score:<br>
      <strong>${score}</strong>
    `;

    saveScore(score);
  }
}
// Utility function to clear all markers and overlays from the map
function clearMap() {
  overlays.forEach(obj => obj.setMap(null));
  overlays = [];
}
// Restart game function to reset score and start a new round
function restartGame() {

  score = 0;
  gameOver = false;

  document.getElementById("score-value").textContent = score;
  document.getElementById("message").innerHTML = "";

  clearMap();
  startRound();
}
// Utility function to calculate distance between two lat/lng points in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {

  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
//  Leaderboard FEATURE
function saveScore(score) {

  let leaderboard =
    JSON.parse(localStorage.getItem("csunLeaderboard")) || [];

  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  leaderboard = leaderboard.slice(0, 5);

  localStorage.setItem("csunLeaderboard", JSON.stringify(leaderboard));

  loadLeaderboard();
}
// Function to load and display the leaderboard
function loadLeaderboard() {

  const leaderboard =
    JSON.parse(localStorage.getItem("csunLeaderboard")) || [];

  const list = document.getElementById("leaderboard-list");

  list.innerHTML = "";

  leaderboard.forEach(score => {
    const li = document.createElement("li");
    li.textContent = `${score} points`;
    list.appendChild(li);
  });
}
