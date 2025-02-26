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

    // Step 1: Search BGG to get the game ID
    const searchResponse = await axios.get(
      `https://www.boardgamegeek.com/xmlapi/search?search=${query}`
    );

    const searchResult = await parser.parseStringPromise(searchResponse.data);

    if (!searchResult.boardgames || !searchResult.boardgames.boardgame) {
      return res.json({ game: null }); // No results found
    }

    const games = Array.isArray(searchResult.boardgames.boardgame)
      ? searchResult.boardgames.boardgame
      : [searchResult.boardgames.boardgame];

    // Get the first game match
    const firstGame = games[0];
    const bggId = firstGame.$.objectid;

    console.log(`✅ Found game ID: ${bggId}, fetching details...`);

    // Step 2: Fetch game details using the BGG ID
    const detailsResponse = await axios.get(
      `https://www.boardgamegeek.com/xmlapi2/thing?id=${bggId}`
    );
    console.log('detailsResponse is: ', detailsResponse);

    const detailsResult = await parser.parseStringPromise(detailsResponse.data);
    console.log('detailsResult is: ', detailsResult);

    if (!detailsResult.items || !detailsResult.items.item) {
      return res.json({ game: null }); // No detailed info found
    }

    const game = detailsResult.items.item;
    console.log('game is: ', game);

    // Extract full game details
    const gameData = {
      bgg_id: bggId,
      name: game.name ? game.name.value : "Unknown",
      year_published: game.yearpublished ? game.yearpublished.value : "Unknown",
      min_players: game.minplayers ? game.minplayers.$.value : "Unknown",
      max_players: game.maxplayers ? game.maxplayers.$.value : "Unknown",
      min_play_time: game.minplaytime ? game.minplaytime.$.value : "Unknown",
      max_play_time: game.maxplaytime ? game.maxplaytime.$.value : "Unknown",
      description: game.description || "No description available.",
      image: game.image || "",
      thumbnail: game.thumbnail || "",
    };

    console.log("✅ Found full game details on BGG:", gameData);
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
