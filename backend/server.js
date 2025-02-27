const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const passport = require("./auth"); // ✅ Load Passport Config
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:3000",
  credentials: true
}));

// ✅ Sessions (Before Passport!)
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "Lax"
  }
}));

// ✅ Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Load Routes
app.use("/api", require("./routes/games"));
app.use("/auth", require("./routes/auth")); // 🔥 Now this is used properly!

// ✅ Serve React Frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ✅ Handle React Frontend Routing
app.get("*", (req, res) => {
  if (!req.user && !req.path.startsWith("/auth") && !req.path.startsWith("/api")) {
    console.log("🔒 User not logged in, redirecting to Google login...");
    return res.redirect("/auth/google");
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start the Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
