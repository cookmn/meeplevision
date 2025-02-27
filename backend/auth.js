const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config(); // Load environment variables

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com/auth/google/callback"
    : "http://localhost:5000/auth/google/callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Google OAuth credentials are missing!");
  process.exit(1);
}

// ✅ Set up Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("🔑 Google Profile:", profile);

      // Here you can store user info in the DB if needed
      return done(null, profile);
    }
  )
);

// ✅ Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// ✅ Deserialize user from session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// ✅ Export Passport Config
module.exports = passport;
