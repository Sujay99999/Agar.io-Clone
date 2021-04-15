// GLOBALS
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
let allPlayers = [];
let orbArr = [];
let leaderboard = [];
// This obj contains the info of this particular player only
const player = {};

////////////////////////////////////////////////////////////////////////////////////

const modal = document.querySelector(".modal");
const playerName = document.querySelector("#modal__name");
const leaderboardWrapper = document.querySelector(".leaderboard__wrapper");
const leaderboardList = document.querySelector(".leaderboard__list");
const scoreboard = document.querySelector(".score__wrapper");
const scoreSpan = document.querySelector(".score");
const messageSpan = document.querySelector(".message");
const messageScore = document.querySelector(".message__score");
const retryButton = document.querySelector(".retry-btn");

// Instantiate the canvas element
const canvas = document.getElementById("canvas");

// The context object contains all the properties, so that we can draw on the canvas
const context = canvas.getContext("2d");

// Change the size of the canvas to fit the window
canvas.width = windowWidth;
canvas.height = windowHeight;

// As soon as the scripts are loaded, we can start the game by showing the opening modal
// NOTE: the load event is present on the window object, whereas the DOMContentLoaded event is present on the document object
window.addEventListener("load", (event) => {
  console.log(event);
  modal.classList.remove("hidden");
});

modal.addEventListener("submit", (event) => {
  console.log(event);
  event.preventDefault();
  console.log(playerName.value);
  player.name = playerName.value;

  // Selecting all classes, with the attribute 'hidden' and removing them
  Array.from(document.querySelectorAll(".hidden")).map((el) => {
    console.log(el);
    el.classList.remove("hidden");
  });

  modal.classList.add("hidden");

  // This init function is present in the next script, and it works beacuse the scripts are fetched already
  init();
});
