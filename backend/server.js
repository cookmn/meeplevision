const db = require("./db");
const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const xml2js = require("xml2js"); // Converts XML to JSON

const parser = new xml2js.Parser({ explicitArray: false });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Define API routes FIRST
app.get("/api/search", async (req, res) => {
  console.log('searching');
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // 🔍 Search the games table in PostgreSQL
    const dbResult = await db.query(
      "SELECT * FROM games WHERE LOWER(name) = LOWER($1)",
      [query]
    );

    if (dbResult.rows.length > 0) {
      console.log("Found in database:", dbResult.rows);
      return res.json({ games: dbResult.rows });
    }

    // If no results found, return an empty array
    return res.json({ games: [] });

  } catch (error) {
    console.error("❌ Error fetching from database:", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const { name, player_count, play_time } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Game name is required' });
    }

    // Insert into database
    const result = await db.query(
      `INSERT INTO games (name, player_count, play_time) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, player_count || null, play_time || null]
    );
    console.log('result is: ', result);

    res.status(201).json({ message: 'Game added successfully', game: result.rows[0] });
  } catch (err) {
    console.error('Error adding game:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/bgg-search", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    console.log(`🔍 Searching BGG for: ${query}`);
    const response = await axios.get(
      `https://www.boardgamegeek.com/xmlapi/search?search=${query}`
    );

    // Convert XML response to JSON
    const result = await parser.parseStringPromise(response.data);

    if (!result.boardgames || !result.boardgames.boardgame) {
      return res.json({ game: null }); // No results found
    }

    const games = Array.isArray(result.boardgames.boardgame)
      ? result.boardgames.boardgame
      : [result.boardgames.boardgame];

    // Get the first game match
    const firstGame = games[0];
    const gameData = {
      name: Array.isArray(firstGame.name) ? firstGame.name[0]._ : firstGame.name._,
      player_count: "Unknown", // BGG API doesn't provide player count directly
      play_time: firstGame.yearpublished ? firstGame.yearpublished._ : "Unknown",
    };

    console.log("✅ Found game on BGG:", gameData);
    res.json({ game: gameData });
  } catch (error) {
    console.error("❌ Error fetching data from BGG:", error.message);
    res.status(500).json({ error: "Failed to fetch data from BGG" });
  }
});

// ✅ Serve frontend static files AFTER defining API routes
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
