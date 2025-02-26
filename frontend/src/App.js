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

  useEffect(() => {
    // Check if user is logged in
    console.log('doing the thing');
    axios.get(`${API_BASE_URL}/auth/status`, { withCredentials: true })
      .then(response => {
        if (response.data.loggedIn) {
          setUser(response.data.user);
        } else {
          window.location.href = `${API_BASE_URL}/auth/google`; // 🔒 Redirect to Google login
        }
      })
      .catch(error => console.error("❌ Error checking auth status:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <h1 className="text-center">Checking authentication...</h1>;
  }

  if (!user) {
    return <h1 className="text-center">Redirecting to login...</h1>;
  }

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
