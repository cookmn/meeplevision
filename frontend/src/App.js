import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Upload from "./components/Upload";
import GameCard from "./components/GameCard"; // Import GameCard
import SuggestAGame from "./components/SuggestAGame";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null); // Track selected game

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/auth/status`, { withCredentials: true })
      .then((response) => {
        if (response.data.loggedIn) {
          setUser(response.data.user);
        } else {
          window.location.href = `${API_BASE_URL}/auth/google`;
        }
      })
      .catch((error) => console.error("❌ Error checking auth status:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h1>Checking authentication...</h1>;

  return (
    <Router>
      <div className="App">
        <header className="p-4 bg-purple-700 text-white text-center">
          <h1 className="text-3xl font-bold">MeepleVision 🎲</h1>
          {user && user.name && <p className="text-lg">Welcome, {user.name || user.name.givenName}!</p>}
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Upload onGameSelect={setSelectedGame} user={user} />} />
            <Route path="/suggestAGame" element={<SuggestAGame />} />
            {selectedGame && <GameCard game={selectedGame} user={user} />}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
