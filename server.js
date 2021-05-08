const express = require("express");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
  path: "./config.env",
});
console.log(process.env.NODE_ENV);

const app = express();
app.use(express.static(`${__dirname}/public`));

const DBString = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DBString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("the DB is connected successfully");
  })
  .catch((err) => {
    console.log(err);
    console.log("error in DB connection");
  });

const port = process.env.PORT || 9876;
const expressServer = app.listen(port, () => {
  console.log(`The server has started on port ${port} `);
});

const io = socketio(expressServer);

module.exports = {
  io,
  app,
  expressServer,
};
