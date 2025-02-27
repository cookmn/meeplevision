const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? "https://meeplevision-950d3d3db41e.herokuapp.com"
      : "http://localhost:3000",
    credentials: true, // ✅ Allows sending cookies/sessions
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretstring",
  resave: false,
  saveUninitialized: false,  // 🚀 Set to false so only logged-in users get a session
  cookie: {
    secure: process.env.NODE_ENV === "production", // ✅ Secure cookies in production
    httpOnly: true, // Prevents JS from accessing cookies
    sameSite: "Lax" // Allows session sharing between frontend & backend
  }
}));

// ✅ Initialize Passport (Auth)
require("./auth"); // Make sure auth.js is properly set up
app.use(passport.initialize());
app.use(passport.session());

// ✅ Import Routes
app.use("/api", require("./routes/games")); // Game routes
app.use("/auth", require("./routes/auth")); // Auth routes

// ✅ Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ✅ Protect the frontend route (force login)
app.get("*", (req, res) => {
  if (!req.user && !req.path.startsWith("/auth") && !req.path.startsWith("/api")) {
    console.log("🔒 User not logged in, redirecting to Google login...");
    return res.redirect("/auth/google");
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
