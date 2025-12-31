import React from "react";
import "./App.css";
import headerImage from "./assets/house.jpg";

function App() {
  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h2 className="logo">PROPERTY HUB</h2>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Header Section with Photo */}
      <header className="header">
        <img src={headerImage} alt="Property" className="header-photo" />
      </header>
    </div>
  );
}

export default App;