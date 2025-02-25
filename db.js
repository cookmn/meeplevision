const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 👈 This is required for Heroku connections!
  },
});

pool.on("connect", () => {
  console.log("✅ Connected to Heroku PostgreSQL");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
