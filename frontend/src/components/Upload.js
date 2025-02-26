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
    <div className="p-4">
      <h1 className="text-2xl mb-4">Search for a Board Game</h1>
      <input
        type="text"
        placeholder="Enter game name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-64"
      />
      <button onClick={searchGames} className="ml-2 p-2 bg-blue-500 text-white rounded">
        Search
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* 🎲 Show Game List */}
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {games.map((game) => (
          <li key={game.id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200 transition-transform transform hover:scale-105">
            <h2 className="text-lg font-bold text-purple-700">{game.name}</h2>
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">Players:</span> {game.player_count}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Play Time:</span> {game.play_time} min
            </p>
          </li>
        ))}
      </ul>

      {/* 🆕 Add Game Form (Only Shows if No Results) */}
      {showAddForm && (
        <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-md bg-gray-100">
          <h2 className="text-lg font-semibold mb-2">Game Not Found – Add a New Game</h2>
          <input
            type="text"
            placeholder="Game Name"
            value={newGame.name}
            onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Player Count (e.g., 2-4)"
            value={newGame.player_count}
            onChange={(e) => setNewGame({ ...newGame, player_count: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="text"
            placeholder="Play Time (e.g., 60-90 min)"
            value={newGame.play_time}
            onChange={(e) => setNewGame({ ...newGame, play_time: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
          <button onClick={addGame} className="mt-2 p-2 bg-green-500 text-white rounded w-full">
            Add Game
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
