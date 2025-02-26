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
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    console.log(`🔍 Searching database for: ${query}`);

    // Step 1: Check if the game exists in our database
    let dbResult = await db.query("SELECT * FROM games WHERE LOWER(name) = LOWER($1)", [query]);

    if (dbResult.rows.length > 0) {
      console.log("✅ Found in database:", dbResult.rows[0]);
      return res.json({ games: dbResult.rows });
    }

    console.log("❌ Game not found in database, fetching from BGG...");

    // Step 2: Fetch game data from BGG
    const bggSearchResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi/search?search=${query}`);
    const searchResult = await parser.parseStringPromise(bggSearchResponse.data);

    if (!searchResult.boardgames || !searchResult.boardgames.boardgame) {
      return res.json({ games: [] }); // No results found on BGG either
    }

    const firstGame = Array.isArray(searchResult.boardgames.boardgame)
      ? searchResult.boardgames.boardgame[0]
      : searchResult.boardgames.boardgame;

    const bggId = firstGame.$.objectid;
    console.log(`✅ Found BGG ID: ${bggId}, fetching details...`);

    dbResult = await db.query("SELECT * FROM games WHERE bgg_id = $1", [bggId]);
    if (dbResult.rows.length > 0) {
      console.log("✅ Found in database:", dbResult.rows[0]);
      return res.json({ games: dbResult.rows });
    }

    // Step 3: Fetch detailed game info from BGG
    const detailsResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${bggId}`);
    const detailsResult = await parser.parseStringPromise(detailsResponse.data);

    if (!detailsResult.items || !detailsResult.items.item) {
      return res.json({ games: [] }); // No detailed data available
    }

    const game = detailsResult.items.item;
    console.log('game is: ', game.name);
    const name = game.name.length ? game.name[0].$.value : game.name.$.value;

    // Extract game details
    const gameData = {
      bgg_id: bggId,
      name: name,
      min_players: game.minplayers ? game.minplayers.$.value : "Unknown",
      max_players: game.maxplayers ? game.maxplayers.$.value : "Unknown",
      play_time: game.playingtime ? game.playingtime.$.value : "Unknown",
      image: game.image || "",
      thumbnail: game.thumbnail || "",
    };

    console.log("✅ Saving game to database:", gameData);

    // Step 4: Insert the new game into our database
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

    // Step 5: Return the newly added game
    return res.json({ games: newGameResult.rows });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Failed to fetch or save game data" });
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

// ✅ Serve frontend static files AFTER defining API routes
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
