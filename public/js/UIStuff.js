// ENTRY FILE FOR THE CLIENT
console.log("uistuff loaded");

// IMPORTED FILES
import * as socketStuff from "./socketStuff.js";
// import * as canvasClient from "./canvasStuff.js";
// GLOBALS TO THIS MODULE
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
const globalObj = {};
// Contains the positions of all the orbs on the canvas
globalObj.orbArr = [];
// This obj contains the info of this particular currPlayer only
globalObj.currPlayer = {};
// Contains the details of the players in the game
globalObj.allPlayers = [];
// Contains the sorted list of the players witht their scores
globalObj.leaderboard = [];

////////////////////////////////////////////////////////////////////////////////////

// DOM elements
const domElements = {};
// domElements.initModal = document.getElementById("modal__init");
// domElements.playerName = document.getElementById("modal__name");
domElements.container = document.querySelector(".container");
domElements.leaderboardWrapper = document.querySelector(
  ".leaderboard__wrapper"
);
domElements.leaderboardList = document.querySelector(".leaderboard__list");
domElements.scoreboard = document.querySelector(".score__wrapper");
domElements.scoreSpan = document.querySelector(".score");
domElements.messageSpan = document.querySelector(".message");
domElements.messageScore = document.querySelector(".message__score");
domElements.retryButton = document.querySelector(".retry-btn");
domElements.canvas = document.getElementById("canvas");

const canvasObj = {};
const initiateCanvas = () => {
  // Instantiate the canvas element
  canvasObj.canvas = domElements.canvas;
  // console.log(canvasObj.canvas);
  // The context object contains all the properties, so that we can draw on the canvas
  canvasObj.context = canvasObj.canvas.getContext("2d");
  // Change the size of the canvas to fit the window
  canvasObj.canvas.width = windowWidth;
  canvasObj.canvas.height = windowHeight;
};

// GAME INITIALIZATION

// As soon as the scripts are loaded, we can start the game by sending the basic event with COOKIE
// NOTE: the load event is present on the window object, whereas the DOMContentLoaded event is present on the document object

window.addEventListener("load", (event) => {
  // NOTE: We seperately call the initaite canvas fn because of the dynamic canvasObj width and height
  // Call the initiatecanvas fn
  initiateCanvas();

  // When the player finally starts the game, it calls the init fuction
  socketStuff.init(globalObj, domElements, canvasObj);
});
