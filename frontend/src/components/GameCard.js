import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

const GameCard = ({ game, user }) => {
  const [rating, setRating] = useState("");
  const [submittedRating, setSubmittedRating] = useState(null);
  const [allRatings, setAllRatings] = useState([]); // Store all user ratings

  // 🔍 Fetch Ratings when component mounts
  useEffect(() => {
    console.log("🔄 useEffect ran!");

    if (!game || !game.id) {
      console.log("❌ No game or game ID available yet.");
      return;
    }

    console.log("📌 Fetching ratings for game:", game.id);

    axios
      .get(`${API_BASE_URL}/api/ratings/${game.id}`, { withCredentials: true }) // 🔥 Fix: Add withCredentials
      .then(response => {
        console.log("📊 Ratings received:", response.data);
        console.log("🔍 User:", user);

        const userRating = response.data.ratings.find(rating => rating.google_id === user.id);
        console.log("👤 Your rating:", userRating);

        setSubmittedRating(userRating ? userRating.rating : null); // ✅ Fix this line
        setAllRatings(response.data.ratings || []);
      })
      .catch(error => {
        console.error("❌ Error fetching ratings:", error);
      });
  }, [game, user]); // ✅ Add `user` as a dependency

  // ⭐ Submit a new rating
  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 10) {
      alert("Please enter a rating between 1 and 10");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ratings`,
        {
          user_id: user.id,
          game_id: game.id,
          rating: parseInt(rating),
        },
        { withCredentials: true }
      );

      console.log("✅ Rating submitted:", response.data);
      console.log('submitting rating');
      setSubmittedRating(rating); // ✅ Store rating
      console.log('all ratings');

      // 🔄 Refresh ratings after submitting
      console.log('user is: ', user);
      setAllRatings([...allRatings, { name: user.displayName, rating, google_id: user.id }]);

    } catch (error) {
      console.error("❌ Error submitting rating:", error);
    }
  };

  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 transition-transform transform hover:scale-105">
      <h2 className="text-xl font-bold text-purple-700">{game.name}</h2>
      {game.thumbnail && (
        <img src={game.thumbnail} alt={game.name} className="w-32 h-32 rounded-lg shadow-md mb-3 mx-auto" />
      )}
      <p className="text-gray-700 mt-2">
        <span className="font-semibold">Players:</span> {game.player_count}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Play Time:</span> {game.play_time} min
      </p>

      {/* ⭐ Rating Input */}
      {!submittedRating && <div className="mt-4">
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Rate 1-10"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="border p-2 rounded w-20"
        />
        <button
          onClick={submitRating}
          className="ml-2 p-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Submit
        </button>
      </div> }

      {/* ⭐ Display User's Rating */}
      {submittedRating !== null && (
        <p className="mt-2 text-green-700">
          ✅ You rated this game: <strong>{submittedRating}/10</strong>
        </p>
      )}

      {/* ⭐ Display All Ratings */}
      {allRatings.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">Ratings:</h3>
          <ul className="list-disc pl-5">
          {allRatings.map((r, index) => {
            console.log('r is: ', r);
        if (r.google_id !== user.id) {
          // ✅ Display OTHER people's ratings normally
          return (
            <li key={index} className="text-gray-700">
              <strong>{r.name.givenName}</strong>: {r.rating}/10
            </li>
          );
        }
      })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameCard;
