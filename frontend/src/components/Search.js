import React, { useState } from "react";
import axios from "axios";
import GameCard from "./GameCard";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

const Search = ({ user }) => {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchGames = async () => {
    if (!query) return;
    setLoading(true);
    setError("");

    try {
      console.log("🔍 Searching database...");
      const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`);
      console.log("Response:", response);
      setGames(response?.data?.games || []);
    } catch (err) {
      setError("Error fetching games. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
      <div className="flex justify-center items-center space-x-2 mb-6">
        <input
          type="text"
          placeholder="Enter game name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-3 rounded-lg text-gray-800 w-80 shadow-md"
        />
        <button
          onClick={searchGames}
          className="p-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-center text-xl">Loading...</p>}
      {error && <p className="text-red-300 text-center">{error}</p>}

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default Search;
