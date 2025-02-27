const express = require("express");
const passport = require("passport");

const router = express.Router();

// ✅ Google Authentication Route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ User authenticated! Redirecting...");
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://meeplevision-950d3d3db41e.herokuapp.com"
        : "http://localhost:3000";
    res.redirect(redirectUrl); // 🔥 Redirect to frontend instead of backend!
  }
);

// ✅ Check if user is logged in
router.get("/status", (req, res) => {
  console.log("📢 Checking auth status:", req.user);
  res.json({ loggedIn: !!req.user, user: req.user || null });
});

// ✅ Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    console.log("👋 User logged out");
    res.redirect("/");
  });
});

module.exports = router;
