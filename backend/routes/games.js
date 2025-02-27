const express = require("express");
const router = express.Router();
const db = require("../db"); // Import database connection
const axios = require("axios");
const xml2js = require("xml2js");

const parser = new xml2js.Parser({ explicitArray: false });

// 🔍 Search for a game in the database or BGG API
router.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query parameter is required" });

  try {
    console.log(`🔍 Searching for: ${query}`);

    let dbResult = await db.query("SELECT * FROM games WHERE LOWER(name) ilike LOWER($1)", [`%${query}%`]);
    if (dbResult.rows.length > 0) {
      return res.json({ games: dbResult.rows });
    }

    // Fetch from BGG API
    console.log("❌ Not found in DB, searching BGG...");
    const bggSearchResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi/search?search=${query}`);
    const searchResult = await parser.parseStringPromise(bggSearchResponse.data);

    if (!searchResult.boardgames || !searchResult.boardgames.boardgame) {
      return res.json({ games: [] });
    }

    // First game match
    const firstGame = Array.isArray(searchResult.boardgames.boardgame)
      ? searchResult.boardgames.boardgame[0]
      : searchResult.boardgames.boardgame;
    const bggId = firstGame.$.objectid;

    // Fetch detailed info from BGG
    console.log(`✅ Fetching details for BGG ID: ${bggId}...`);
    const detailsResponse = await axios.get(`https://www.boardgamegeek.com/xmlapi2/thing?id=${bggId}`);
    const detailsResult = await parser.parseStringPromise(detailsResponse.data);
    if (!detailsResult.items || !detailsResult.items.item) return res.json({ games: [] });

    const game = detailsResult.items.item;
    const name = Array.isArray(game.name) ? game.name[0].$.value : game.name.$.value;
    const gameData = {
      bgg_id: bggId,
      name,
      min_players: game.minplayers ? game.minplayers.$.value : "Unknown",
      max_players: game.maxplayers ? game.maxplayers.$.value : "Unknown",
      play_time: game.playingtime ? game.playingtime.$.value : "Unknown",
      image: game.image || "",
      thumbnail: game.thumbnail || "",
    };

    console.log("✅ Saving to database:", gameData);
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
    return res.json({ games: newGameResult.rows });

  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Failed to fetch or save game data" });
  }
});

// 🆕 Add a game manually
router.post("/games", async (req, res) => {
  try {
    const { name, player_count, play_time } = req.body;
    if (!name) return res.status(400).json({ error: "Game name is required" });

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

router.get("/suggest", async (req, res) => {
    try {
      const { numPlayers, playTime } = req.query;
      console.log(`🔎 Searching for games with ${numPlayers} players and ${playTime} minutes`);
  
      if (!numPlayers || !playTime) {
        return res.status(400).json({ error: "Number of players and play time are required" });
      }
  
      const query = `
        SELECT * FROM games
        WHERE 
          (
            -- Case 1: Exact match (single integer stored as text)
            player_count ~ '^[0-9]+$' AND CAST(player_count AS INTEGER) = $1

            -- Case 2: Range match (e.g., "2-4")
            OR (
              player_count LIKE '%-%'
              AND CAST(split_part(player_count, '-', 1) AS INTEGER) <= $1
              AND CAST(split_part(player_count, '-', 2) AS INTEGER) >= $1
            )
          )
          AND (
            -- Case 1: Exact match (single integer stored as text)
            play_time ~ '^[0-9]+$' AND CAST(play_time AS INTEGER) = $2

            -- Case 2: Range match (e.g., "30-60")
            OR (
              play_time LIKE '%-%'
              AND CAST(split_part(play_time, '-', 1) AS INTEGER) <= $2
              AND CAST(split_part(play_time, '-', 2) AS INTEGER) >= $2
            )
          )
        ORDER BY name;
    `;

    console.log(numPlayers, playTime);
    const values = [parseInt(numPlayers), parseInt(playTime)];

    const result = await db.query(query, values);
      res.json({ games: result.rows });
    } catch (error) {
      console.error("❌ Error fetching game suggestions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

module.exports = router;
