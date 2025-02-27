import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Search from "./components/Search";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

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
      .catch((error) => {
        console.error("❌ Error checking auth status:", error);
      })
      .finally(() => {
        console.log("✅ Auth check complete.");
        setLoading(false);
      });
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
          <h1 className="text-3xl font-bold">MeepleVision 🎲</h1>
          <p className="text-lg">Welcome, {user.displayName.split(" ")[0]}!</p>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Search user={user} />} />
            <Route path="/upload" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
