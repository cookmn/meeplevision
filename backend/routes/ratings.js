const express = require("express");
const db = require("../db"); // Database connection
const router = express.Router();

// ✅ Submit a rating
router.post("/", async (req, res) => {
    console.log('req.body is: ', req.body);
    const { user_id, game_id, rating } = req.body;

    if (!user_id || !game_id || !rating) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const result = await db.query(
            `INSERT INTO ratings (user_id, game_id, rating) 
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, game_id) 
             DO UPDATE SET rating = EXCLUDED.rating
             RETURNING *`,
            [user_id, game_id, rating]
        );

        res.json({ message: "Rating submitted!", rating: result.rows[0] });
    } catch (error) {
        console.error("❌ Error submitting rating:", error);
        res.status(500).json({ error: "Database error" });
    }
});

// 🏆 Get All Games Rated by User
router.get("/myGames", async (req, res) => {
    console.log('in my games');
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(req.user);
  
    try {
      const result = await db.query(
        `SELECT g.id, g.name, g.thumbnail, r.rating 
         FROM ratings r 
         JOIN games g ON r.game_id = g.id 
         WHERE r.user_id = $1 
         ORDER BY r.rating DESC, g.name ASC`,
        [req.user.google_id]
      );
  
      res.json({ games: result.rows });
    } catch (error) {
      console.error("❌ Error fetching rated games:", error);
      res.status(500).json({ error: "Failed to fetch rated games" });
    }
  });

  // ✅ Fetch ratings for a game
router.get("/:gameId", async (req, res) => {
    const { gameId } = req.params;

    try {
        const result = await db.query(
            `SELECT ratings.rating, ratings.game_id, users.name, users.google_id
             FROM ratings 
             JOIN users ON ratings.user_id = users.google_id 
             WHERE ratings.game_id = $1`,
            [gameId]
          );
        res.json({ ratings: result.rows });
    } catch (error) {
        console.error("❌ Error fetching ratings:", error);
        res.status(500).json({ error: "Database error" });
    }
});

module.exports = router;
