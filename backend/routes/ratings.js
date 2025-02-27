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
