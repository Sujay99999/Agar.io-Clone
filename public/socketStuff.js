// This is the file that deals with client socket

// Getting the io variable
const clientSocket = io();

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
    }, 500);
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
    // console.log(clientSocket.id, player.locX, player.locY);
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
    console.log(msg);
  });

  // Listening for the  killed message
  clientSocket.on("killed", (msg) => {
    console.log(msg);
  });

  // Listening for the updateLeaderboard event, and update the scores
  // accordingly
  clientSocket.on("updateLeaderboard", (newLeaderboard) => {
    leaderboard = newLeaderboard;
    console.log(leaderboard);
  });
};
