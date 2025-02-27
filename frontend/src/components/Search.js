import React, { useState, useEffect } from "react";
import axios from "axios";
import GameCard from "./GameCard"; // Component for displaying a game

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

const Search = () => {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [bggGame, setBggGame] = useState(null);
  const [newGame, setNewGame] = useState({
    name: "",
    player_count: "",
    play_time: "",
  });

  // 🔍 Search for Games
  const searchGames = async () => {
    if (!query) return;
    setLoading(true);
    setError("");
    setShowAddForm(false);
    setBggGame(null);

    try {
      console.log("🔍 Searching database...");
      const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`);
      console.log("Response:", response);
      setGames(response?.data?.games || []);

      if (!response?.data?.games?.length) {
        console.log("❌ Game not found in database, checking BGG...");
        fetchGameFromBGG(query);
      }
    } catch (err) {
      setError("Error fetching games. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🌍 Fetch Missing Game from BGG
  const fetchGameFromBGG = async (gameName) => {
    try {
      console.log(`🌍 Searching for ${gameName} in BGG...`);
      const response = await axios.get(`${API_BASE_URL}/api/bgg-search?query=${gameName}`);

      if (response?.data?.game) {
        console.log("✅ Found full game details from BGG:", response.data.game);
        setBggGame(response.data.game);
        setShowAddForm(true);
        setNewGame({
          name: response.data.game.name,
          player_count: `${response.data.game.min_players}-${response.data.game.max_players}`,
          play_time: response.data.game.play_time || "Unknown",
        });
      } else {
        console.log("❌ No game found on BGG.");
        setShowAddForm(true);
        setNewGame({ ...newGame, name: gameName });
      }
    } catch (err) {
      console.error("❌ Error fetching from BGG:", err.message);
      setShowAddForm(true);
      setNewGame({ ...newGame, name: gameName });
    }
  };

  // 🆕 Add a New Game to the Database
  const addGame = async () => {
    try {
      console.log("➕ Adding new game:", newGame);
      await axios.post(`${API_BASE_URL}/api/games`, newGame);
      setError("");
      alert("✅ Game added successfully!");
      searchGames(); // Re-run search
      setShowAddForm(false);
    } catch (err) {
      setError("Error adding game. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
      {/* 🌟 Pretty Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold">MeepleVision 🎲</h1>
        <p className="text-lg text-gray-200 mt-2">Find your favorite board games or add new ones!</p>
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
          <GameCard key={game.id} game={game} />
        ))}
      </ul>

      {/* 🌍 Show Game from BGG if Not in Database */}
      {bggGame && (
        <div className="mt-8 p-6 border border-yellow-400 bg-yellow-100 rounded-lg shadow-xl text-gray-900 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-center text-yellow-700 mb-4">⚠️ This game is from BoardGameGeek</h2>
          <p className="text-center mb-4 text-gray-700">This data is not yet in our database.</p>

          <div className="flex flex-col items-center">
            {bggGame.thumbnail && (
              <img src={bggGame.thumbnail} alt={bggGame.name} className="w-32 h-32 rounded-lg shadow-md mb-3" />
            )}
            <h2 className="text-xl font-bold text-purple-700">{bggGame.name}</h2>
            <p className="text-gray-700 mt-2">
              <span className="font-semibold">Players:</span> {bggGame.min_players} - {bggGame.max_players}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Play Time:</span> {bggGame.play_time} Minutes
            </p>
          </div>
        </div>
      )}

      {/* 🆕 Add Game Form */}
      {showAddForm && (
        <div className="mt-8 p-6 border border-gray-300 rounded-lg shadow-xl bg-gray-100 text-gray-900 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-center text-purple-700 mb-4">Game Not Found – Add a New Game</h2>
          <input
            type="text"
            placeholder="Game Name"
            value={newGame.name}
            onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3 shadow-md"
          />
          <input
            type="text"
            placeholder="Player Count (e.g., 2-4)"
            value={newGame.player_count}
            onChange={(e) => setNewGame({ ...newGame, player_count: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3 shadow-md"
          />
          <input
            type="text"
            placeholder="Play Time (e.g., 60-90 min)"
            value={newGame.play_time}
            onChange={(e) => setNewGame({ ...newGame, play_time: e.target.value })}
            className="border p-3 rounded-lg w-full mb-3 shadow-md"
          />
          <button
            onClick={addGame}
            className="mt-3 p-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg w-full transition-transform transform hover:scale-105"
          >
            Add Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
