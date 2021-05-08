// This is the file that deals with client socket
console.log("socketstuff loaded");
// imports
import { io } from "socket.io-client";
import * as canvasStuff from "./canvasStuff.js";

// Getting the io variable
console.log(`${location.protocol}//${location.host}`);
const clientSocket = io(location.href);
console.log("clientsocket is", clientSocket);

// const getCookies = function () {
//   var pairs = document.cookie.split(";");
//   var cookies = {};
//   for (var i = 0; i < pairs.length; i++) {
//     var pair = pairs[i].split("=");
//     cookies[(pair[0] + "").trim()] = unescape(pair.slice(1).join("="));
//   }
//   return cookies;
// };
// console.log(getCookies());

// When the user actually starts the game, he calls the function init()
export const init = (globalObj, domElements, canvasObj) => {
  // The draw is an recursive fn that starts drwaing the canvas
  canvasStuff.draw(globalObj, domElements, canvasObj);
  canvasStuff.mouseListner(globalObj, domElements, canvasObj);

  // Error handlers
  clientSocket.on("connect_error", (err) => {
    console.log("connect_error handler", err); // not authorized
  });

  clientSocket.on("disconnect", (reason) => {
    console.log("disconnect handler", reason);
    setTimeout(() => {
      domElements.retryButton.addEventListener("click", () => {
        window.location.reload();
      });
    }, 3000);
  });

  // The init event marks the actual start of the game and starts
  // change of messages to the server
  setTimeout(() => {
    console.log(clientSocket.id);
    clientSocket.emit("initEvent", {
      id: clientSocket.id,
    });
  }, 1000);
  // Then the client must listen for an event named Initreturn
  // This inturn emits a tick event
  // This has a delay of 1sec to maintain the smoothness
  clientSocket.on("initReturn", (msg) => {
    console.log("the initReturn msg is with orbArr adn the usrename ", msg);
    globalObj.currPlayer.name = msg.userName;
    globalObj.orbArr = msg.orbArr;
    setTimeout(() => {
      console.log("started transmitting data to the server");
      setInterval(function () {
        console.log(
          "data is sent to the server",
          globalObj.currPlayer.xVector,
          globalObj.currPlayer.yVector
        );
        clientSocket.emit("tick", {
          id: clientSocket.id,
          xVector: globalObj.currPlayer.xVector,
          yVector: globalObj.currPlayer.yVector,
        });
      }, 100);
    }, 1000);
  });

  // The socket must also listen to the tock function, that contains
  // the newly fetched coordinates of the items in canvas
  clientSocket.on("tock", (tockData) => {
    console.log("data recieved from the server");
    globalObj.allPlayers = tockData;
    // console.log("allPLayers", globalObj.allPlayers);
    const tempPlayer = globalObj.allPlayers.find((playerEl) => {
      return playerEl.socketId === clientSocket.id;
    });

    // In the case, where the player is either terminated or disconnected, we must
    // ensure that the function is returned
    if (!tempPlayer) {
      // console.log("reutrn");
      return;
    }

    globalObj.currPlayer.locX = tempPlayer.locX;
    globalObj.currPlayer.locY = tempPlayer.locY;
    globalObj.currPlayer.score = tempPlayer.score;
    console.log("currplayer", globalObj.currPlayer);
  });

  // Listening for the orbreplacement arr and updating it accordingly
  clientSocket.on("orbReplacement", (data) => {
    globalObj.orbArr = data.orbArr;
  });

  // Listening for the playerReplacement event, and then displaying it
  // as a flash message
  clientSocket.on("playerReplacement", (msg) => {
    console.log(msg);
  });

  // Listening for the got killed message
  clientSocket.on("gotKilled", (msg) => {
    domElements.messageSpan.style.opacity = 1;
    domElements.messageScore.style.opacity = 1;
    domElements.messageSpan.textContent = msg.msg;
    domElements.messageScore.textContent = msg.score;
    setTimeout(() => {
      domElements.messageSpan.style.opacity = 0;
      domElements.messageScore.style.opacity = 0;
      domElements.retryButton.style.opacity = 1;
    }, 5000);
    domElements.retryButton.addEventListener("click", () => {
      window.location.reload();
    });
  });

  // Listening for the  killed message
  clientSocket.on("killed", (msg) => {
    domElements.messageSpan.style.opacity = 1;
    domElements.messageSpan.textContent = msg;
    setTimeout(() => {
      domElements.messageSpan.style.opacity = 0;
    }, 3000);
  });

  // Listening for the updateLeaderboard event, and update the scores
  // accordingly
  clientSocket.on("updateLeaderboard", (newLeaderboard) => {
    globalObj.leaderboard = newLeaderboard;
    console.log(globalObj.leaderboard);
  });

  // Listening for the general event, where we display the message
  clientSocket.on("generalMessage", (msg) => {
    domElements.messageSpan.style.opacity = 1;
    domElements.messageSpan.textContent = msg;
    setTimeout(() => {
      domElements.messageSpan.style.opacity = 0;
    }, 3000);
  });
};
