const path = require("path");

const express = require("express");
const pug = require("pug");
const cookieParser = require("cookie-parser");

const app = require("./../server.js").app;
const socketStuff = require("./../socketStuff/default");
const AppError = require("./utils/AppError");
const authRouter = require("./routes/authRouter");
const globalErrorHandler = require("./controllers/errorController");
const gameController = require("./controllers/gameController");
const authController = require("./controllers/authController");

// Indentifies any cookies, and attaches them to the incoming request
app.use(cookieParser());

//This middleware is used to set the templating engine to PUG
app.set("view engine", "pug");
//This sets the views that are need to be rendered to the views folder (i.e. MVC architecture)
app.set("views", path.join(__dirname, "./../views"));

/////////////////////////////////////
// SERVER INITIALIZATION

// Create the orbArr and initialize the sokcet listners
socketStuff.initGame();
socketStuff.initSocketListners();

// Main route
app.get(
  "/",
  (req, res, next) => {
    // this middleware is used to check for the presence of the token and if the user is authenticated he is
    // redirected to the game directly
    if (!req.cookies || !req.cookies["jwtCookie"]) {
      // As there is no cookie, pass onto the next middleware
      return next();
    }
    const response = authController.verifyCookieToken(req.cookies["jwtCookie"]);
    if (response instanceof AppError) {
      return next();
    }
    res.redirect("/game");
  },
  (req, res) => {
    console.log(
      "There is no cookie found. Waiting for the user to wither login with google or play anonmously"
    );
    // 1) render the init page. this page has a very small load on the js and doesnt load the heavy scripts
    res.render("initTemplate");
  }
);

// For login purposes
app.use("/auth", authRouter);

// Game Route
app.get("/game", gameController.playGame);

// All Other Undefined route handler
app.all("*", (req, res, next) => {
  return next(new AppError(`the route ${req.originalUrl} is not defined`, 404));
});

// Global error handler
app.use(globalErrorHandler);
