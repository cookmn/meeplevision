const db = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const path = require("path");

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

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

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
