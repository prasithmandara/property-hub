import React from "react";
import "./App.css";
import headerImage from "./assets/house.jpg";
import propertiesData from "./data/properties.json";

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

      {/* Properties Section */}
      <section className="properties">
        <h2 className="section-title">Available Properties</h2>
        <div className="property-list">
          {propertiesData.properties.map((property) => (
            <div key={property.id} className="property-card">
              <img
                src={`/${property.picture}`} 
                alt={property.type}
                className="property-image"
              />
              <div className="property-info">
                <h3>{property.type} - {property.bedrooms} Bedrooms</h3>
                <p className="price">£{property.price.toLocaleString()}</p>
                <p className="location">{property.location}</p>
                <p className="tenure"><strong>Tenure:</strong> {property.tenure}</p>
                <p className="description">{property.description}</p>
                <a href={property.url} className="details-link">View Details</a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;