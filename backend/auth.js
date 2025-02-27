const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db"); // ✅ Make sure we're using the database
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://meeplevision-950d3d3db41e.herokuapp.com/auth/google/callback"
          : "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("🔑 Google Profile:", profile);

      try {
        // Extract Google user info
        const googleId = profile.id;
        const name = profile.displayName;
        const email = profile.emails[0].value;
        const picture = profile.photos[0].value;

        // ✅ Check if user already exists
        const userCheck = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);

        if (userCheck.rows.length > 0) {
          console.log("✅ User already exists:", userCheck.rows[0]);

          // ✅ Optional: Update profile picture in case it changed
          await db.query("UPDATE users SET profile_picture = $1 WHERE google_id = $2", [picture, googleId]);

          return done(null, userCheck.rows[0]); // Existing user
        }

        console.log("➕ New user detected, adding to database...");

        // ✅ Insert new user
        const insertQuery = `
          INSERT INTO users (id, google_id, name, email, profile_picture)
          VALUES (gen_random_uuid(), $1, $2, $3, $4)
          RETURNING *;
        `;

        const newUser = await db.query(insertQuery, [googleId, name, email, picture]);

        console.log("✅ New user added:", newUser.rows[0]);
        return done(null, newUser.rows[0]); // Return new user
      } catch (error) {
        console.error("❌ Error handling Google authentication:", error);
        return done(error, null);
      }
    }
  )
);

// Serialize user (store in session)
passport.serializeUser((user, done) => {
  done(null, user.google_id);
});

// Deserialize user (fetch from DB)
passport.deserializeUser(async (googleId, done) => {
  try {
    const user = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
    done(null, user.rows[0]);
  } catch (error) {
    done(error, null);
  }
});
