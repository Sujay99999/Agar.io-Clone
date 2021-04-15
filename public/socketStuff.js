// This is the file that deals with client socket

// Getting the io variable
const clientSocket = io("http://127.0.0.1:3000/");

// When the user actually starts the game, he calls the function init()
const init = () => {
  // The draw is an recursive fn that starts drwaing the canvas
  draw();

  // The init event marks the actual start of the game and starts
  // change of messages to the server
  clientSocket.emit("init", player.name, clientSocket.id);

  // Then the client must listen for an event named Initreturn
  // This inturn emits a tick event
  clientSocket.on("initReturn", (msg) => {
    orbArr = msg.orbArr;
    setInterval(function () {
      clientSocket.emit("tick", {
        id: clientSocket.id,
        xVector: player.xVector,
        yVector: player.yVector,
      });
    }, 100);
  });

  // The socket must also listen to the tock function, that contains
  // the newly fetched coordinates of the items in canvas
  clientSocket.on("tock", (tockData) => {
    allPlayers = tockData.players;
    const tempPlayer = allPlayers.find((player) => {
      return player.socketId === clientSocket.id;
    });

    // In the case, where the player is either terminated or disconnected, we must
    // ensure that the function is returned
    if (!tempPlayer) return;

    player.locX = tempPlayer.locX;
    player.locY = tempPlayer.locY;
    player.score = tempPlayer.score;
  });

  // Listening for the orbreplacement arr and updating it accordingly
  clientSocket.on("orbReplacement", (data) => {
    orbArr = data.orbArr;
  });

  // Listening for the playerReplacement event, and then displaying it
  // as a flash message
  clientSocket.on("playerReplacement", (msg) => {
    console.log(msg);
  });

  // Listening for the got killed message
  clientSocket.on("gotKilled", (msg) => {
    messageSpan.style.opacity = 1;
    messageScore.style.opacity = 1;
    messageSpan.textContent = msg.msg;
    messageScore.textContent = msg.score;
    setTimeout(() => {
      messageSpan.style.opacity = 0;
      messageScore.style.opacity = 0;
      retryButton.style.opacity = 1;
    }, 5000);
    retryButton.addEventListener("click", () => {
      window.location.reload();
    });
  });

  // Listening for the  killed message
  clientSocket.on("killed", (msg) => {
    messageSpan.style.opacity = 1;
    messageSpan.textContent = msg;
    setTimeout(() => {
      messageSpan.style.opacity = 0;
    }, 3000);
  });

  // Listening for the updateLeaderboard event, and update the scores
  // accordingly
  clientSocket.on("updateLeaderboard", (newLeaderboard) => {
    leaderboard = newLeaderboard;
    console.log(leaderboard);
  });

  // Listening for the general event, where we display the message
  clientSocket.on("generalMessage", (msg) => {
    messageSpan.style.opacity = 1;
    messageSpan.textContent = msg;
    setTimeout(() => {
      messageSpan.style.opacity = 0;
    }, 3000);
  });
};
