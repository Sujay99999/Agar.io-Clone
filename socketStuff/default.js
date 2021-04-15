// This is the server file for the socket.io

// Even though the file is already required initally, we can run the file again,
// and exposes the same variables
const io = require("./../server.js").io;
const Orb = require("./classes/Orb.js");

const checkForOrbCollisions = require("./checkCollisions.js")
  .checkForOrbCollisions;
const checkForPlayerCollisions = require("./checkCollisions.js")
  .checkForPlayerCollisions;

// Importing the classes
// This class contains the whole details of the player -- Only stored on the server
const PlayerTotalInfo = require("./classes/PlayerTotalInfo.js");
// This class contains the details of the player not to be shared -- Only stored on the server
const PlayerOtherInfo = require("./classes/PlayerOtherInfo.js");
// This class contains the details of the player to be shared -- Shared to client and server
const PlayerInfo = require("./classes/PlayerInfo.js");

// Globals for the server
const orbArr = [];
const players = [];
const settings = {
  defaultRadius: 10,
  defaultSpeed: 15,
  defaultZoom: 10,
  defaultOrbs: 100,
  canvasWidth: 500,
  canvasHeight: 500,
  tickTime: 100,
};

// This function is called, when the server is initialized
const initGame = () => {
  // Create an Orbs array
  // The global orbs arr is same for all players and can be only changed on the server
  for (let i = 0; i < settings.defaultOrbs; i++) {
    orbArr.push(new Orb(settings));
  }
};

// When there is a client connected to the socket, this function is called

// When we see a client starts to play the game, the client must have access
// to certain information
// The server must contain information about the player and all the players

io.on("connection", (socket) => {
  // Even though the client gets connected to server, the details are not shared until
  // the player starts the game

  // This player object contains the details of the cooresponding socket that is connected
  let connectedPlayerTotalInfo = {};

  // For future purposes, all the connected clinet are added to the
  // game room of the default namespace
  socket.join("room");

  // The server then listens to the init event, to actually start the game
  // and ONLY send some data back to the client
  socket.on("init", (playerName, id) => {
    const playerInfo = new PlayerInfo(playerName, id, settings);
    const playerOtherInfo = new PlayerOtherInfo(settings);
    connectedPlayerTotalInfo = new PlayerTotalInfo(
      socket.id,
      playerInfo,
      playerOtherInfo
    );
    players.push(playerInfo);

    // This is sent as a response
    socket.emit("initReturn", {
      orbArr,
    });

    // This event is responsible for sending all the data,
    // that is required by all the client to render all the players
    // and their updated locations, size and score
    setInterval(function () {
      io.to("room").emit("tock", {
        players,
        // locX: connectedPlayerTotalInfo.playerInfo.locX,
        // locY: connectedPlayerTotalInfo.playerInfo.locY,
      });
    }, settings.tickTime);

    // This listener captures the new vector of the particular player
    // and updates the coordinates respectively
    socket.on("tick", (data) => {
      // console.log(players);
      // The data contains the player's new vector position, and here, wee need to
      // update the players coordinates

      // // Getting the particularplayer from the player's array
      // const currentPlayer =

      // Because of the speed the js is not able to remove the previous circle
      // console.log(connectedPlayerTotalInfo);
      // console.log("name is " + connectedPlayerTotalInfo.playerInfo.name);
      const speed = connectedPlayerTotalInfo.playerOtherInfo.speed;

      // Updating the xvectorand the yvector of the player
      connectedPlayerTotalInfo.playerOtherInfo.xVector = data.xVector;
      connectedPlayerTotalInfo.playerOtherInfo.yVector = data.yVector;

      if (
        ((connectedPlayerTotalInfo.playerInfo.locX < 10 && data.xVector < 0) ||
          (connectedPlayerTotalInfo.playerInfo.locX >
            settings.canvasWidth - 10 &&
            data.xVector > 0)) &&
        ((connectedPlayerTotalInfo.playerInfo.locY < 10 && data.yVector > 0) ||
          (connectedPlayerTotalInfo.playerInfo.locY >
            settings.canvasHeight - 10 &&
            data.yVector < 0))
      ) {
        // Do nothing
        // console.log("Do nothing");
      } else if (
        (connectedPlayerTotalInfo.playerInfo.locX < 10 && data.xVector < 0) ||
        (connectedPlayerTotalInfo.playerInfo.locX > settings.canvasWidth - 10 &&
          data.xVector > 0)
      ) {
        // console.log("cond1");
        connectedPlayerTotalInfo.playerInfo.locY -= speed * data.yVector;
      } else if (
        (connectedPlayerTotalInfo.playerInfo.locY < 10 && data.yVector > 0) ||
        (connectedPlayerTotalInfo.playerInfo.locY >
          settings.canvasHeight - 10 &&
          data.yVector < 0)
      ) {
        // console.log("cond2");
        connectedPlayerTotalInfo.playerInfo.locX += speed * data.xVector;
      } else {
        // console.log("cond4");
        connectedPlayerTotalInfo.playerInfo.locX += speed * data.xVector;
        connectedPlayerTotalInfo.playerInfo.locY -= speed * data.yVector;
      }

      // Checking for the collision, and if there is any, we correspondingly update
      // the players array

      //NOTE: we should not use async await, as we need to implement seperate
      // then and catch blocks

      // Collision for PLAYER and ORB
      // The resolved promise contains the index of the orb , that is consumed as well
      // as reproduced again at a differnt position
      const orbPlayerCollisionPromise = checkForOrbCollisions(
        connectedPlayerTotalInfo.playerInfo,
        connectedPlayerTotalInfo.playerOtherInfo,
        orbArr,
        settings
      );
      orbPlayerCollisionPromise
        .then((consumedOrbIndex) => {
          console.log(consumedOrbIndex);

          // When there is actually a collision with an orb, we need to update the
          // orbArr and also the updated arr to all the clients
          io.to("room").emit("orbReplacement", {
            consumedOrbIndex,
            orbArr,
          });

          // Its not necessary to update the leaderboard every frame, instead, we can
          // just update it when the player's stats are changed. i.e when orb is
          // consumed
          io.to("room").emit(
            "updateLeaderboard",
            // It's an array of scores of all the players
            players
              .map((playerInfo) => {
                return {
                  name: playerInfo.name,
                  score: playerInfo.score,
                };
              })
              .sort((a, b) => {
                return b.score > a.score;
              })
          );
        })
        .catch((err) => console.error(err));

      // Collision for PLAYER and PLAYER
      const playerPlayerCollisionPromise = checkForPlayerCollisions(
        connectedPlayerTotalInfo.playerInfo,
        connectedPlayerTotalInfo.playerOtherInfo,
        players
      );
      playerPlayerCollisionPromise
        .then((updatedScores) => {
          // NOTE: This function is only called by the killer socket

          // Firstly, findout the died socket and remove him from the room
          const diedSocket = io.sockets.sockets.get(
            updatedScores.died.socketId
          );

          // And also send a message to the killed player, that he is terminated
          // and the socket is also removed from the room.
          diedSocket.emit("gotKilled", {
            msg: `Sorry, buddy, you have been killed by ${updatedScores.killedBy.name}`,
            score: updatedScores.killedBy.score,
          });
          diedSocket.leave("room");

          // In case of collision between player and player, we must send a message
          // to all connected players except the killed player,
          // that the player has been terminated.
          socket
            .to("room")
            .emit(
              "playerReplacement",
              `Player ${updatedScores.died.name} is killed by ${updatedScores.killedBy.name}`
            );

          // We can also send a congratulations message to the killer
          socket.emit(
            "killed",
            `Congrats, you have successfully killed ${updatedScores.died.name}`
          );

          // Its not necessary to update the leaderboard every frame, instead, we can
          // just update it when the player's stats are changed. i.e when orb is
          // consumed
          io.to("room").emit(
            "updateLeaderboard",
            // It's an array of scores of all the players
            players
              .map((playerInfo) => {
                return {
                  name: playerInfo.name,
                  score: playerInfo.score,
                };
              })
              .sort((a, b) => {
                return b.score > a.score;
              })
          );
        })
        .catch((err) => console.error(err));
    });

    // Listen for the disconnecting event
    socket.on("disconnecting", (reason) => {
      socket.leave("room");

      const disconnectedSocket = players.find((playerEl) => {
        return (playerEl.socketId = socket.id);
      });
      const disconnectedSocketIndex = players.findIndex((playerEl) => {
        return (playerEl.socketId = socket.id);
      });

      // Correspondingly change the players arr
      players.splice(disconnectedSocketIndex, 1);

      // Emit an message to all the connected players
      io.to("room").emit(
        "generalMessage",
        `The player ${disconnectedSocket.name} has been disconnected, ${reason}`
      );
    });
  });
});

////////////////////////////////////////////////////////////////////////////
initGame();
