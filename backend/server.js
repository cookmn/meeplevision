const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const xml2js = require("xml2js"); // Converts XML to JSON
const db = require("./db"); // Database connection
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
require("./auth"); // Ensure authentication is set up

const app = express();
const parser = new xml2js.Parser({ explicitArray: false });

const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://meeplevision-950d3d3db41e.herokuapp.com"], // Allow frontend
    credentials: true, // ✅ Allow cookies
  })
);

// ✅ Session & Passport (for Google Auth)
app.use(
  session({
    secret: "supersecretstring",
    resave: false,
    saveUninitialized: false, // ✅ Important for session persistence
    cookie: { secure: false, httpOnly: true, sameSite: "lax" }, // ✅ Allow cookies
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ----------------------------------------------
// 🔥  API ROUTES
// ----------------------------------------------

// ✅ Search for a game in our database or BGG API
app.get("/api/search", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    console.log(`🔍 Searching database for: ${query}`);

    // Step 1: Check database
    let dbResult = await db.query("SELECT * FROM games WHERE LOWER(name) = LOWER($1)", [query]);

    if (dbResult.rows.length > 0) {
      console.log("✅ Found in database:", dbResult.rows);
      return res.json({ games: dbResult.rows });
    }

    console.log("❌ Game not found in database, fetching from BGG...");

    // Step 2: Search BGG API for the game
    const bggSearchResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi/search?search=${query}`);
    const searchResult = await parser.parseStringPromise(bggSearchResponse.data);

    if (!searchResult.boardgames || !searchResult.boardgames.boardgame) {
      return res.json({ games: [] }); // No results found
    }

    // Step 3: Get first game match & its BGG ID
    const firstGame = Array.isArray(searchResult.boardgames.boardgame)
      ? searchResult.boardgames.boardgame[0]
      : searchResult.boardgames.boardgame;
    const bggId = firstGame.$.objectid;

    console.log(`✅ Found BGG ID: ${bggId}, fetching details...`);

    // Step 4: Check if the game is already in our database by BGG ID
    dbResult = await db.query("SELECT * FROM games WHERE bgg_id = $1", [bggId]);
    if (dbResult.rows.length > 0) {
      console.log("✅ Found in database:", dbResult.rows[0]);
      return res.json({ games: dbResult.rows });
    }

    // Step 5: Fetch detailed game info from BGG
    const detailsResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${bggId}`);
    const detailsResult = await parser.parseStringPromise(detailsResponse.data);

    if (!detailsResult.items || !detailsResult.items.item) {
      return res.json({ games: [] }); // No detailed data available
    }

    const game = detailsResult.items.item;
    const name = Array.isArray(game.name) ? game.name[0].$.value : game.name.$.value;

    // Extract details
    const gameData = {
      bgg_id: bggId,
      name,
      min_players: game.minplayers ? game.minplayers.$.value : "Unknown",
      max_players: game.maxplayers ? game.maxplayers.$.value : "Unknown",
      play_time: game.playingtime ? game.playingtime.$.value : "Unknown",
      image: game.image || "",
      thumbnail: game.thumbnail || "",
    };

    console.log("✅ Saving game to database:", gameData);

    // Step 6: Insert into database
    const insertQuery = `
      INSERT INTO games (id, bgg_id, name, player_count, play_time, image, thumbnail) 
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) 
      RETURNING *;
    `;
    
    const insertValues = [
      gameData.bgg_id,
      gameData.name,
      `${gameData.min_players}-${gameData.max_players}`,
      gameData.play_time,
      gameData.image,
      gameData.thumbnail,
    ];
    
    const newGameResult = await db.query(insertQuery, insertValues);
    console.log("✅ Game successfully added to database!", newGameResult.rows[0]);

    // Step 7: Return newly added game
    return res.json({ games: newGameResult.rows });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Failed to fetch or save game data" });
  }
});

// ✅ Add a game manually to the database
app.post("/api/games", async (req, res) => {
  try {
    const { name, player_count, play_time } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Game name is required" });
    }

    const result = await db.query(
      `INSERT INTO games (id, name, player_count, play_time) 
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
      [name, player_count || null, play_time || null]
    );

    res.status(201).json({ message: "Game added successfully", game: result.rows[0] });
  } catch (err) {
    console.error("❌ Error adding game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------------------------------------
// 🔥 AUTH ROUTES (Google Login)
// ----------------------------------------------

// ✅ Start Google Authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✅ Google OAuth callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

// ✅ Get Current User's Info
app.get("/auth/status", (req, res) => {
  console.log("🕵️ Checking auth status...");
  console.log("Session user:", req.user);

  if (req.user) {
    console.log("✅ User is logged in:", req.user);
    res.json({ loggedIn: true, user: req.user });
  } else {
    console.log("❌ User is NOT logged in.");
    res.json({ loggedIn: false });
  }
});

// ✅ Logout User
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// ----------------------------------------------
// 🔥 FRONTEND SERVING
// ----------------------------------------------

// ✅ Serve static files from React frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ✅ Only serve frontend for non-API, non-auth routes
app.get("*", (req, res) => {
  if (!req.user && !req.path.startsWith("/auth") && !req.path.startsWith("/api")) {
    console.log("🔒 User not logged in, redirecting to Google login...");
    return res.redirect("/auth/google");
  }
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
