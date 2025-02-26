import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://meeplevision-950d3d3db41e.herokuapp.com";

const Search = () => {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
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

    try {
      console.log("Trying to search...");
      const response = await axios.get(`${API_BASE_URL}/api/search?query=${query}`);
      console.log("Response is:", response);
      setGames(response?.data?.games || []);

      if (!response?.data?.games?.length) {
        console.log("No game found, prompting user to add.");
        setShowAddForm(true);
        setNewGame({ ...newGame, name: query });
      }
    } catch (err) {
      setError("Error fetching games. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Add a New Game to the Database
  const addGame = async () => {
    try {
      console.log("Adding new game:", newGame);
      await axios.post(`${API_BASE_URL}/api/games`, newGame);
      setError("");
      alert("Game added successfully!");

      // Re-run the search to show the new game in the list
      searchGames();
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
          <li key={game.id} className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 transition-transform transform hover:scale-105">
            <h2 className="text-xl font-bold text-purple-700">{game.name}</h2>
            <p className="text-gray-700 mt-2">
              <span className="font-semibold">Players:</span> {game.player_count}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Play Time:</span> {game.play_time} min
            </p>
          </li>
        ))}
      </ul>

      {/* 🆕 Add Game Form (Only Shows if No Results) */}
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
