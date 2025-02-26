import React, { useState } from "react";
import axios from "axios";

// const API_BASE_URL = "https://meeplevision-950d3d3db41e.herokuapp.com";
const API_BASE_URL = "http://localhost:5000";

const Search = () => {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔍 Search for Games
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
      {/* 🌟 Pretty Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold">MeepleVision 🎲</h1>
        <p className="text-lg text-gray-200 mt-2">Find your favorite board games!</p>
      </header>

      {/* 🔍 Search Bar */}
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

      {/* 🎲 Show Game List */}
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <li key={game.id} className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 transition-transform transform hover:scale-105">
            {game.thumbnail && (
              <img src={game.thumbnail} alt={game.name} className="w-32 h-32 rounded-lg shadow-md mb-3 mx-auto" />
            )}
            <h2 className="text-xl font-bold text-purple-700 text-center">{game.name}</h2>
            <p className="text-gray-700 mt-2 text-center">
              <span className="font-semibold">Players:</span> {game.player_count}
            </p>
            <p className="text-gray-700 text-center">
              <span className="font-semibold">Play Time:</span> {game.play_time} min
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
