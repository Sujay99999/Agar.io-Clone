// This is the server file for the socket.io

// Even though the file is already required initally, we can run the file again,
// and exposes the same variables
const util = require("util");
const jwt = require("jsonwebtoken");

const io = require("./../server.js").io;
const Orb = require("./classes/Orb.js");
const AppError = require("./../expressStuff/utils/AppError");
const authController = require("./../expressStuff/controllers/authController");

const checkForOrbCollisions = require("./checkCollisions.js")
  .checkForOrbCollisions;
const checkForPlayerCollisions = require("./checkCollisions.js")
  .checkForPlayerCollisions;

// Global classes for the server
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
  tickTime: 2000,
};

// This function is called, when the server is initialized
module.exports.initGame = () => {
  console.log("Basic game template and orbArr has been created");
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
module.exports.initSocketListners = async () => {
  console.log("the socket listners on the server side has been initialized");
  io.of("/game").use(async (socket, next) => {
    try {
      // Here, we need to authenticate the user based on
      // 1) Cookie if present

      if (
        socket.request.headers.cookie &&
        socket.request.headers.cookie.split("=")[0] === "jwtCookie"
      ) {
        // NOTE: Here, we must verify the payload and get the user from the db and then only pass onto the next middleware
        // For now, the user obj attached is
        console.log("verify cookitoken fn called");
        const response = await authController.verifyCookieToken(
          socket.request.headers.cookie.split("=")[1]
        );
        if (response instanceof AppError) {
          console.log(
            "didnt allow to user to connect, as his details were wrong"
          );
          return next(response);
        }
        console.log("response is", response);

        // If the user with the token is already playing, we must restrict him
        // We must loop through the players arr, and filter them out
        const doubleRolePlayer = players.find((player) => {
          return player.databaseUserId === response.id;
        });
        if (doubleRolePlayer) {
          console.log("NO CHEATING MFF");
          return next(new AppError("NO CHEATING MFF", 401));
        }

        socket.user = response;
        return next();
      } else if (
        socket.handshake.query.name &&
        socket.handshake.query.name.length > 0
      ) {
        // If the user is not able to authenticate himself, atleast he can play the basic version, by taking the
        // name from the query string

        // 2) Query parameter if present
        // Or else, return a error
        console.log("query param fn called");
        socket.user = {
          id: "anonymous",
          provider: "local",
          name: socket.handshake.query.name,
        };
        return next();
      }
      // next(new AppError(404, "You are not allowed to access the route"));
      console.log("noe cookie present or query param");
      next(new AppError("no cookie present or query param", 404));
    } catch (error) {
      console.log("auth error catcher", error);
      next(error);
    }
  });
  io.of("/game").on("connection", (socket) => {
    // console.log(io);
    console.log("the socket is connected", socket.id);
    console.log("the socket name is " + socket.user.name);
    // Even though the client gets connected to server, there is a initial round of message exchange

    // This player object contains the details of the cooresponding socket that is connected
    let connectedPlayerTotalInfo = {};

    // For future purposes, all the connected clinet are added to the
    // game room of the default namespace
    socket.join("room");

    // The server then listens to the init event, to actually start the game
    // and ONLY send some data back to the client
    socket.on("initEvent", (data) => {
      // console.log(data);
      const playerInfo = new PlayerInfo(socket.user, data.id, settings);
      const playerOtherInfo = new PlayerOtherInfo(settings);
      connectedPlayerTotalInfo = new PlayerTotalInfo(
        data.id,
        playerInfo,
        playerOtherInfo
      );
      players.push(playerInfo);
      console.log(players);

      // This is sent as a response
      socket.emit("initReturn", {
        orbArr,
        userName: socket.user.name,
      });

      // This event is responsible for sending all the data,
      // that is required by all the client to render all the players
      // and their updated locations, size and score
      // console.log("player data on server is", players);
      setInterval(function () {
        console.log("player data that is sent to client");
        io.of("/game").to("room").emit("tock", players);
      }, settings.tickTime);

      // This listener captures the new vector of the particular player
      // and updates the coordinates respectively
      socket.on("tick", (data) => {
        // console.log("tick data");
        // The data contains the player's new vector position, and here, wee need to
        // update the players coordinates

        // Because of the speed the js is not able to remove the previous circle
        // console.log(connectedPlayerTotalInfo);
        // console.log("name is " + connectedPlayerTotalInfo.playerInfo.name);
        const speed = connectedPlayerTotalInfo.playerOtherInfo.speed;

        // Updating the xvectorand the yvector of the player
        connectedPlayerTotalInfo.playerOtherInfo.xVector = data.xVector;
        connectedPlayerTotalInfo.playerOtherInfo.yVector = data.yVector;

        if (
          ((connectedPlayerTotalInfo.playerInfo.locX < 10 &&
            data.xVector < 0) ||
            (connectedPlayerTotalInfo.playerInfo.locX >
              settings.canvasWidth - 10 &&
              data.xVector > 0)) &&
          ((connectedPlayerTotalInfo.playerInfo.locY < 10 &&
            data.yVector > 0) ||
            (connectedPlayerTotalInfo.playerInfo.locY >
              settings.canvasHeight - 10 &&
              data.yVector < 0))
        ) {
          // Do nothing
          // console.log("Do nothing");
        } else if (
          (connectedPlayerTotalInfo.playerInfo.locX < 10 && data.xVector < 0) ||
          (connectedPlayerTotalInfo.playerInfo.locX >
            settings.canvasWidth - 10 &&
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
        console.log(
          connectedPlayerTotalInfo.playerInfo.locX,
          connectedPlayerTotalInfo.playerInfo.locY
        );

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
            // console.log(consumedOrbIndex);

            // When there is actually a collision with an orb, we need to update the
            // orbArr and also the updated arr to all the clients
            io.of("/game").to("room").emit("orbReplacement", {
              consumedOrbIndex,
              orbArr,
            });

            // Its not necessary to update the leaderboard every frame, instead, we can
            // just update it when the player's stats are changed. i.e when orb is
            // consumed
            io.of("/game")
              .to("room")
              .emit(
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
          .catch((err) => {
            // console.error(err);
          });

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
            const diedSocket = io
              .of("/game")
              .sockets.sockets.get(updatedScores.died.socketId);

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
            io.of("/game")
              .of("/game")
              .to("room")
              .emit(
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
          .catch((err) => {
            console.error(err);
          });
      });

      // Listen for the disconnecting event
      socket.on("disconnect", (reason) => {
        console.log("Dissconnected", socket.user.name);
        socket.leave("room");

        const disconnectedSocket = players.find((playerEl) => {
          return playerEl.socketId === socket.id;
        });
        console.log(disconnectedSocket);
        // console.log("the disconnected socket is", disconnectedSocket.name);
        const disconnectedSocketIndex = players.findIndex((playerEl) => {
          return playerEl.socketId === socket.id;
        });
        // console.log("before slicing", players);
        // Correspondingly change the players arr
        players.splice(disconnectedSocketIndex, 1);
        // console.log("after slicing", players);
        // Emit an message to all the connected players
        io.of("/game")
          .to("room")
          .emit(
            "generalMessage",
            `The player ${disconnectedSocket.name} has been disconnected, ${reason}`
          );
      });
    });
  });
};

////////////////////////////////////////////////////////////////////////////
// initGame();
