// GLOBALS
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
let allPlayers = [];
let orbArr = [];
let leaderBoard = [];
// This obj contains the info of this particular player only
const player = {};

////////////////////////////////////////////////////////////////////////////////////

// Instantiate the canvas element
const canvas = document.getElementById("the-canvas");

// The context object contains all the properties, so that we can draw on the canvas
const context = canvas.getContext("2d");

// Change the size of the canvas to fit the window
canvas.width = windowWidth;
canvas.height = windowHeight;

// As soon as the scripts are loaded, we can start the game by showing the opening modal
// NOTE: the load event is present on the window object, whereas the DOMContentLoaded event is present on the document object
window.addEventListener("load", (event) => {
  //BUG:
  // NOTE: These properties are only avaible for jquery scripts of v3
  $("#loginModal").modal("show");
});

$(".name-form").submit((event) => {
  event.preventDefault();
  player.name = document.getElementById("name-input").value;
  $("#loginModal").modal("hide");
  $("#spawnModal").modal("show");

  document.querySelector(".player-name").textContent = player.name;
});

document.querySelector(".start-game").addEventListener("click", (event) => {
  $("#spawnModal").modal("hide");

  // Selecting all classes, with the attribute 'hidden' and removing them
  $(".hiddenOnStart").removeAttr("hidden");

  // This init function is present in the next script, and it works beacuse the scripts are fetched already
  init();
});
