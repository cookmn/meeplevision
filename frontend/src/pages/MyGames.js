import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

const MyGames = ({ user }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      console.log("❌ No user logged in, skipping API call.");
      setLoading(false);
      return;
    }

    console.log("🔄 Fetching games for user:", user);
    axios
      .get(`${API_BASE_URL}/api/ratings/myGames`, { withCredentials: true })
      .then((response) => {
        console.log("✅ API Response:", response.data);
        setGames(response.data.games || []);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch rated games:", err);
        setError("❌ Failed to fetch rated games.");
      })
      .finally(() => {
        console.log("✅ Finished fetching games.");
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-extrabold">⭐ My Rated Games</h1>
        <p className="text-lg text-gray-200 mt-2">
          See all the games you've rated!
        </p>
      </header>

      {loading && <p className="text-center text-xl">⏳ Loading...</p>}
      {error && <p className="text-red-300 text-center">{error}</p>}

      {/* Show Games */}
      {games.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <li
              key={game.id}
              className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 transition-transform transform hover:scale-105"
            >
              {game.thumbnail && (
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-32 h-32 mx-auto mb-3 rounded-lg shadow-md"
                />
              )}
              <h2 className="text-xl font-bold text-purple-700 text-center">
                {game.name}
              </h2>
              <p className="text-gray-700 text-center mt-2">
                <span className="font-semibold">Your Rating:</span>{" "}
                <span className="text-yellow-500 font-bold">{game.rating}/10</span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <p className="text-center text-lg text-gray-300">
            🤷‍♂️ No rated games found.
          </p>
        )
      )}
    </div>
  );
};

export default MyGames;
