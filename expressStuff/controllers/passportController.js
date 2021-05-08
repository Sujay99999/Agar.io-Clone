const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const { async } = require("regenerator-runtime");

const User = require("./../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        //   console.log(profile, accessToken);
        // NOTE: Here, i am unable to access the req.user as it is not added to it yet
        // NOTE: Here we must verify the user or add the user to the db
        console.log("profileis ", profile);
        const user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log("this is a old user");
          cb(null, user);
        }
        // create a new user based on the details
        const newUser = await User.create({
          name: profile.displayName,
          googleId: profile.id,
          avatar: profile.photos[0].value,
        });
        console.log("this is a new user");
        cb(null, newUser);
      } catch (error) {
        console.error(error);
      }
    }
  )
);
