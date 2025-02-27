import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

const SuggestAGame = () => {
  const [numPlayers, setNumPlayers] = useState("");
  const [playTime, setPlayTime] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // 🎯 Fetch Suggested Games
  const fetchSuggestedGames = async () => {
    if (!numPlayers || !playTime) {
      setError("⚠️ Please enter both the number of players and play time.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/suggest`, {
        params: { numPlayers, playTime },
      });
      setGames(response.data.games || []);

      if (!response.data.games.length) {
        setError("😔 No games found. Try adjusting your search!");
      }
    } catch (err) {
      setError("❌ Error fetching game suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 flex flex-col items-center">
      {/* 🌟 Header */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold">🎲 Game Suggestions</h1>
        <p className="text-lg text-gray-200 mt-2">
          Enter the number of players and playtime to get a recommendation!
        </p>
      </header>

      {/* 🎯 Input Fields */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        <input
          type="number"
          placeholder="Number of Players"
          value={numPlayers}
          onChange={(e) => setNumPlayers(e.target.value)}
          className="border p-3 rounded-lg text-gray-800 w-full shadow-md"
        />
        <input
          type="number"
          placeholder="Play Time (minutes)"
          value={playTime}
          onChange={(e) => setPlayTime(e.target.value)}
          className="border p-3 rounded-lg text-gray-800 w-full shadow-md"
        />
        <button
          onClick={fetchSuggestedGames}
          disabled={loading}
          className={`p-3 font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 w-full ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 text-white"
          }`}
        >
          {loading ? "Searching..." : "🎲 Suggest a Game!"}
        </button>
      </div>

      {/* ⏳ Loading State */}
      {loading && <p className="text-center text-xl mt-4">⏳ Finding games...</p>}

      {/* ⚠️ Error Messages */}
      {error && !loading && <p className="text-red-300 text-center mt-4">{error}</p>}

      {/* 🎲 Show Game List */}
      {games.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {games.map((game) => (
            <li
              key={game.id}
              className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 transition-transform transform hover:scale-105 text-center"
            >
              {game.thumbnail && (
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-32 h-32 mx-auto mb-3 rounded-lg shadow-md object-cover"
                />
              )}
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
      )}

      {/* 😢 No Results */}
      {searched && !loading && !games.length && !error && (
        <p className="text-gray-300 text-center mt-4">No games match your criteria. Try different values!</p>
      )}
    </div>
  );
};

export default SuggestAGame;
