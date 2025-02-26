const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
<<<<<<< HEAD
const db = require("./db");
require("dotenv").config();

// ✅ Ensure environment variables are loaded
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth environment variables!");
}

// ✅ Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production"
        ? "https://meeplevision-950d3d3db41e.herokuapp.com/auth/google/callback"
        : "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ Google profile received:", profile);

        // Extract user data
        const googleId = profile.id;
        const name = profile.displayName;
        const email = profile.emails[0].value;
        const photo = profile.photos[0].value;

        // Check if user exists in DB
        const existingUser = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);

        let user;
        if (existingUser.rows.length > 0) {
          user = existingUser.rows[0];
          console.log("✅ User found in database:", user);
        } else {
          // Insert new user
          const insertQuery = `INSERT INTO users (google_id, name, email, photo) VALUES ($1, $2, $3, $4) RETURNING *`;
          const insertValues = [googleId, name, email, photo];
          const newUser = await db.query(insertQuery, insertValues);
          user = newUser.rows[0];
          console.log("✅ New user added:", user);
        }

        return done(null, user);
      } catch (err) {
        console.error("❌ Error in Google OAuth:", err);
        return done(err, null);
      }
    }
  )
);

// ✅ Serialize & Deserialize User
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, user.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
=======
const session = require("express-session");
const db = require("./db");
require("dotenv").config();
console.log("🔍 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("🔍 GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("🔍 CALLBACK_URL:", process.env.CALLBACK_URL);

module.exports = (app) => {
  // 🛠 Session Middleware (Keeps Users Logged In)
  app.use(
    session({
      secret: "meeple-secret", // Change this to a strong secret in production
      resave: false,
      saveUninitialized: true,
    })
  );

  // 🛠 Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // 🔑 Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("✅ Google Profile:", profile);

          // Check if the user exists in our database
          const userResult = await db.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);

          if (userResult.rows.length === 0) {
            console.log("🆕 New User! Adding to database...");

            // Insert new user
            const newUser = await db.query(
              "INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *",
              [profile.id, profile.displayName, profile.emails[0].value]
            );
            return done(null, newUser.rows[0]);
          } else {
            console.log("✅ User Found in Database:", userResult.rows[0]);
            return done(null, userResult.rows[0]);
          }
        } catch (error) {
          console.error("❌ Error in Google OAuth:", error);
          return done(error, null);
        }
      }
    )
  );

  // 🔄 Serialize & Deserialize User (Stores user in session)
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, userResult.rows[0]);
  });

  // 🌍 Google OAuth Routes
  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      console.log("✅ Login Successful! Redirecting...");
      res.redirect("/"); // Redirect to home after login
    }
  );

  app.get("/auth/logout", (req, res) => {
    req.logout(() => {
      console.log("👋 User logged out");
      res.redirect("/");
    });
  });

  // 🔍 Get Current Logged-in User
  app.get("/auth/user", (req, res) => {
    res.json(req.user || null);
  });
};
>>>>>>> eb6e95f (Fix: Update OAuth callback URL for Heroku)
