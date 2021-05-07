const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, cb) => {
      //   console.log(profile, accessToken);
      // NOTE: Here, i am unable to access the req.user as it is not added to it yet
      // NOTE: Here we must verify the user or add the user to the db

      cb(null, profile);
    }
  )
);
