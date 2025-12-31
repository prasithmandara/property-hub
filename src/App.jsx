import React, { useState } from "react";
import "./App.css";
import headerImage from "./assets/house.jpg";
import propertiesData from "./data/properties.json";

function App() {
  const [filterType, setFilterType] = useState("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Filter properties based on type and price range
  const filteredProperties = propertiesData.properties.filter((property) => {
    const matchesType =
      filterType === "any" ||
      property.type.toLowerCase() === filterType.toLowerCase();

    const matchesMin =
      minPrice === "" || property.price >= parseInt(minPrice, 10);

    const matchesMax =
      maxPrice === "" || property.price <= parseInt(maxPrice, 10);

    return matchesType && matchesMin && matchesMax;
  });

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

        {/* Filter Bar */}
        <div className="filter-bar">
          <label htmlFor="typeFilter">Type:</label>
          <select
            id="typeFilter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="any">Any</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
            <option value="Apartment">Apartment</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Bungalow">Bungalow</option>
          </select>

          <label htmlFor="minPrice">Min Price:</label>
          <input
            type="number"
            id="minPrice"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 300000"
          />

          <label htmlFor="maxPrice">Max Price:</label>
          <input
            type="number"
            id="maxPrice"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 800000"
          />
        </div>

        <div className="property-list">
          {filteredProperties.map((property) => (
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