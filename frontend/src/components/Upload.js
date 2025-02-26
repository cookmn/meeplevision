import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://meeplevision-950d3d3db41e.herokuapp.com";

const Search = () => {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchGames = async () => {
    if (!query) return;
    setLoading(true);
    setError("");

    try {
        console.log('trying');
      const response = await axios.get(
        `${API_BASE_URL}/api/search?query=${query}`
      );
      console.log('response is: ', response);
      setGames(response?.data?.games || []);
    } catch (err) {
      setError("Error fetching games. Try again.");
    } finally {
      setLoading(false);
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

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {games.map((game) => (
    <li
      key={game.id}
      className="bg-white shadow-md rounded-lg p-4 border border-gray-200 transition-transform transform hover:scale-105"
    >
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

    </div>
  );
};

export default Search;