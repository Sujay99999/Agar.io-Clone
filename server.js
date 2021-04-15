const express = require("express");
const socketio = require("socket.io");
const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env",
});
console.log(process.env.NODE_ENV);

const app = express();
app.use(express.static(`${__dirname}/public`));

const port = process.env.PORT || 3000;
const expressServer = app.listen(port, () => {
  console.log(`The server has started on port ${port} `);
});

const io = socketio(expressServer);

module.exports = {
  io,
  app,
};
