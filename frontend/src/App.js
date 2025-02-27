import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Upload from "./components/Upload";
import Search from "./components/Search";
import SuggestAGame from "./pages/SuggestAGame"; // 🎲 New page!
import MyGames from "./pages/MyGames";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

// 🎯 Home Page with Navigation
function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6">
      <h1 className="text-4xl font-extrabold">MeepleVision 🎲</h1>
      <p className="text-lg text-gray-200 mt-2">Find, rate, and discover board games!</p>

      <div className="mt-6 space-x-4">
        <button
          onClick={() => navigate("/search")}
          className="p-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          🔍 Search Games
        </button>
        <button
          onClick={() => navigate("/suggestAGame")}
          className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          🎲 Suggest a Game!
        </button>
        <button
          onClick={() => navigate("/myGames")}
          className="p-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          🎲 My Games!
        </button>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🌐 Checking auth status...");
    axios
      .get(`${API_BASE_URL}/auth/status`, { withCredentials: true })
      .then((response) => {
        console.log("🔍 Auth status response:", response.data);
        if (response.data.loggedIn) {
          console.log("✅ User is logged in:", response.data.user);
          setUser(response.data.user);
        } else {
          console.log("❌ User not logged in, redirecting...");
          window.location.href = `${API_BASE_URL}/auth/google`;
        }
      })
      .catch((error) => console.error("❌ Error checking auth status:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <h1 className="text-center">Checking authentication...</h1>;
  }

  if (!user) {
    return <h1 className="text-center text-red-500">❌ Authentication failed. Try refreshing.</h1>;
  }

  return (
    <Router>
      <div className="App">
        <header className="p-4 bg-purple-700 text-white text-center">
          <h1 className="text-3xl font-bold">Welcome to MeepleVision, {user.name || user.givenName}! 🎲</h1>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/search" element={<Upload user={user} />} />
            <Route path="/suggestAGame" element={<SuggestAGame />} />
            <Route path="/myGames" element={<MyGames user={user} />} />
            <Route path="*" element={<Navigate replace to="/" />} /> {/* Redirect unknown routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
