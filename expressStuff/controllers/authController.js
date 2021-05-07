const jwt = require("jsonwebtoken");
const util = require("util");

require("./passportController");
const AppError = require("./../utils/AppError");

module.exports.sendCookie = (req, res, next) => {
  // Here the data of the user, is present in the req.user

  // Here, we must encode the mongodb id of the user rather than using the google id
  const jwtToken = jwt.sign(
    { id: req.user.id, provider: req.user.provider },
    process.env.JWT_SECRET
  );
  res.cookie("jwtCookie", jwtToken, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_TIME),
    httpOnly: true,
  });

  next();
};

module.exports.redirectGame = (req, res, next) => {
  // Here, we need to redirect to the game page, so that the authenticated user can now start the game
  console.log(req.user.id, "from redirectGame middlware");
  res.redirect("/game");
};

module.exports.verifyCookieToken = async (token) => {
  try {
    // In this middleware, we verify the token from the cookie

    // 1) Decode the token as sent from the browser and attach the verified user on the req
    const decodedPayload = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    console.log("the decoded payload is ", decodedPayload);

    // NOTE: Here, we must verify the payload and get the user from the db and then only pass onto the next middleware
    // For now, the user obj attached is
    return {
      name: "sumedha",
    };
  } catch (error) {
    return new AppError(404, "Unable to verify the user using the cookie");
  }
};

// module.exports.verifyBasic = (req, res) => {
//   // 1)Check if there is any user based on the given parameters else send a error
//   // 2)Upon succussful verification, send back a jwt token
// };

// module.exports.verify = (req, res, next) => {
//   // If the person is authentcated, then add his name to the req.user.name

//   // 1) Check if there is any jwt token
//   if (req.cookies && req.cookies.jwtToken) {
//     const decodedPayload = decodeCookie(req.cookie.jwtToken);
//   }
//   // 2) or if not, check if the params contains name property
//   if (req.query.name) {
//     // Add the name to the user property
//     console.log("req", req.query);
//     req.user = {
//       name: req.query.name,
//     };

//     // pass onto the next middleware
//     return next();
//   }
//   // 3) If none of the options work, then send back a error
//   // next(new Error("fuck you"));
//   next(new AppError("Verification failed. Please provide proper details", 401));
//   // next();
// };
