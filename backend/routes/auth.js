const express = require("express");
const passport = require("passport");
const router = express.Router();

// ✅ Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("✅ User authenticated! Redirecting...");
    res.redirect(process.env.NODE_ENV === "production"
      ? "https://meeplevision-950d3d3db41e.herokuapp.com"
      : "http://localhost:3000");
  }
);

// ✅ Auth Status Route
router.get("/status", (req, res) => {
  console.log("🔍 Checking auth status:", req.user);
  res.json({ loggedIn: !!req.user, user: req.user || null });
});

// ✅ Logout Route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

module.exports = router;
