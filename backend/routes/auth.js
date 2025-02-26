const express = require("express");
const passport = require("passport");
const router = express.Router();

// 🔐 Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
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
  res.json({ loggedIn: !!req.user, user: req.user || null });
});

// 🔓 Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
