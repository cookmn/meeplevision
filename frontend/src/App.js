import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Upload from "./components/Upload";
import axios from "axios";
import "./App.css";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://meeplevision-950d3d3db41e.herokuapp.com"
    : "http://localhost:5000";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    console.log("🌐 Checking auth status...");

    axios
      .get(`${API_BASE_URL}/auth/status`, { withCredentials: true }) // ✅ Ensures cookies are sent
      .then((response) => {
        console.log("🔍 Auth status response:", response.data);
        if (response.data.loggedIn) {
          console.log("✅ User is logged in:", response.data.user);
          setUser(response.data.user);
        } else {
          console.log("❌ Not logged in.");
          setRetry(true); // ✅ Show retry button instead of auto-redirecting
        }
      })
      .catch((error) => {
        console.error("❌ Error checking auth status:", error);
        setRetry(true);
      })
      .finally(() => {
        console.log("✅ Auth check complete.");
        setLoading(false);
      });
  }, []);

  // ⏳ Show loading while checking auth
  if (loading) {
    return <h1 className="text-center">Checking authentication...</h1>;
  }

  // 🔄 Retry button if auth fails
  if (retry && !user) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-red-500 text-2xl">❌ Authentication failed.</h1>
        <p className="text-gray-500">Try logging in again.</p>
        <button
          onClick={() => (window.location.href = `${API_BASE_URL}/auth/google`)}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
        >
          Retry Login
        </button>
      </div>
    );
  }

  // ✅ If user is logged in, show the main app
  return (
    <Router>
      <div className="App">
        <header className="p-4 bg-purple-700 text-white text-center">
          <h1 className="text-3xl font-bold">MeepleVision 🎲</h1>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/upload" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
