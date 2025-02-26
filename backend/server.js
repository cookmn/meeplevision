const express = require("express");
const cors = require("cors");
const path = require("path");
const xml2js = require("xml2js"); // Converts XML to JSON
const session = require("express-session");
const passport = require("passport");
const path = require("path");
require("dotenv").config();
require("./auth"); // Load authentication

const app = express();

require("./auth")(app);
const PORT = process.env.PORT || 5000;

// ✅ Apply CORS Middleware BEFORE Routes
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com" 
    : "http://localhost:3000",
  credentials: true, // ✅ Allows sending cookies/sessions
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Apply Express Session & Passport BEFORE Routes
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // ✅ Secure cookies only in production
    httpOnly: true,
    sameSite: "Lax"
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Import Routes AFTER Middleware
app.use("/api", require("./routes/games")); // All API endpoints
app.use("/auth", require("./routes/auth")); // Authentication endpoints

// ✅ Serve React Frontend (Must be after API/Auth routes)
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ✅ Catch-All for React Frontend (Only if NOT an API/Auth route)
app.get("*", (req, res) => {
  if (!req.user && !req.path.startsWith("/auth") && !req.path.startsWith("/api")) {
    console.log("🔒 User not logged in, redirecting to Google login...");
    return res.redirect("/auth/google");
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
