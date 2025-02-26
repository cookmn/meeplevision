const { Pool } = require("pg");
require("dotenv").config();

const DATABASE_URL = 'postgres://u5daavtek96iju:p9681a29a7b90fbba762cae1c2f5ece922934fe5f1ffd7bb3c6e7bf6f361c1a5a@c67okggoj39697.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/dbv4slk99h04en';


const isHeroku = DATABASE_URL && DATABASE_URL.includes("amazonaws.com");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isHeroku ? { rejectUnauthorized: false } : false, // 🔥 Use SSL only on Heroku
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
