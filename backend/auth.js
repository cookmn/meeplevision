const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

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

// ✅ Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("🔑 Google Profile:", profile);
      return done(null, profile);
    }
  )
);

// ✅ Serialize User (Save to session)
passport.serializeUser((user, done) => {
  done(null, user);
});

// ✅ Deserialize User (Retrieve from session)
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
