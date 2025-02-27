import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

const GameCard = ({ game, user }) => {
  const [rating, setRating] = useState("");
  const [submittedRating, setSubmittedRating] = useState(null);

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/ratings/${game.id}`);
      const userRating = response.data.ratings.find(r => r.user_id === user.id);
      if (userRating) {
        setSubmittedRating(userRating.rating);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const submitRating = async () => {
    if (!rating || rating < 1 || rating > 10) {
      alert("Please enter a rating between 1 and 10");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/ratings`, {
        user_id: user.id,
        game_id: game.id,
        rating: parseInt(rating),
      });

      setSubmittedRating(rating);
      fetchRatings();
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
    }
  };

  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 transition-transform transform hover:scale-105">
      <h2 className="text-xl font-bold text-purple-700">{game.name}</h2>
      <p><span className="font-semibold">Players:</span> {game.player_count}</p>
      <p><span className="font-semibold">Play Time:</span> {game.play_time} min</p>
      {submittedRating ? (
        <p className="text-green-600">Your Rating: {submittedRating}/10</p>
      ) : (
        <div>
          <input type="number" min="1" max="10" value={rating} onChange={(e) => setRating(e.target.value)} />
          <button onClick={submitRating}>Submit Rating</button>
        </div>
      )}
    </div>
  );
};

export default GameCard;
