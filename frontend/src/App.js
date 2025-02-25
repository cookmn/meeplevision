import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Upload from "./components/Upload"; // Upload component where AI happens
import "./App.css"; // Your existing styles

function App() {
  return (
    <Router>
      <div className="App">
        
        <main>
          <Routes>
            <Route path="/upload" element={<Upload />} /> {/* Page for image upload and AI */}
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;