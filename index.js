require("./socketStuff/default.js");
require("./expressStuff/app.js");

const expressServer = require("./server.js");

process.on("uncaughtException", (error) => {
  // Need to shut down the application and the server immediately.
  console.log("Shutting down the server and the application immediately");
  console.log(error.message);
  console.log(error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  // Need to shut down the application and the server gracefuly.
  console.log("Shutting down the server and the application");
  console.log(error.message);
  console.log(error);
  expressServer.close(() => {
    process.exit(1);
  });
});

// Handling Sigterm signals
process.on("SIGTERM", () => {
  console.log("SIGTERM recieved");
  server.close(() => {
    console.log("Terminating the application");
  });
});
