Agar.io Clone

This is an implementation of the Agar.io game using the Socket.io library API.
This repository conatins two parts:
Client-side files and Server-side files

Client-side files
These are the files under the public folder that are exposed to the browser
There is a main index.html built using bootstrap
There are 3 js files namely UIStuff, canvasStuff and socketStuff
and these files are NOT ES6 modules
UIStuff > canvasStuff > socketStuff

Server-side files
The main entry point is the index.js file, which inturn imports the other files
namely deafult.js and server.js, which under the hood, runs these files
These files setup the express server and the socket.io server and exposes them

///////////////////////////////////////////////////
JUMPING STONES

Could not able to recreate the clamping of the camera to the player's position
