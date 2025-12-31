import React, { useState, useEffect } from "react";
import "./App.css";
import headerImage from "./assets/house.jpg";
import propertiesData from "./data/properties.json";

function App() {
  const [filterType, setFilterType] = useState("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [maxBedrooms, setMaxBedrooms] = useState("");
  const [afterDate, setAfterDate] = useState("");
  const [beforeDate, setBeforeDate] = useState("");
  const [postcodeArea, setPostcodeArea] = useState("");
  const [favourites, setFavourites] = useState([]);

  // Load favourites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favourites");
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  // Save favourites to localStorage
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // Helper: convert property "added" object to JS Date
  const getPropertyDate = (added) => {
    return new Date(`${added.month} ${added.day}, ${added.year}`);
  };

  // Toggle favourite
  const toggleFavourite = (propertyId) => {
    setFavourites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Filter properties
  const filteredProperties = propertiesData.properties.filter((property) => {
    const matchesType =
      filterType === "any" ||
      property.type.toLowerCase() === filterType.toLowerCase();

    const matchesMinPrice =
      minPrice === "" || property.price >= parseInt(minPrice, 10);

    const matchesMaxPrice =
      maxPrice === "" || property.price <= parseInt(maxPrice, 10);

    const matchesMinBedrooms =
      minBedrooms === "" || property.bedrooms >= parseInt(minBedrooms, 10);

    const matchesMaxBedrooms =
      maxBedrooms === "" || property.bedrooms <= parseInt(maxBedrooms, 10);

    const propertyDate = getPropertyDate(property.added);

    const matchesAfterDate =
      afterDate === "" || propertyDate >= new Date(afterDate);

    const matchesBeforeDate =
      beforeDate === "" || propertyDate <= new Date(beforeDate);

    const matchesPostcode =
      postcodeArea === "" ||
      property.location.toUpperCase().startsWith(postcodeArea.toUpperCase());

    return (
      matchesType &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesMinBedrooms &&
      matchesMaxBedrooms &&
      matchesAfterDate &&
      matchesBeforeDate &&
      matchesPostcode
    );
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

      {/* Header Section */}
      <header className="header">
        <img src={headerImage} alt="Property" className="header-photo" />
      </header>

      {/* Properties Section */}
      <section className="properties">
        <h2 className="section-title">Available Properties</h2>

        {/* Filter Bar */}
        <div className="filter-bar">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="any">Any</option>
            <option value="House">House</option>
            <option value="Flat">Flat</option>
            <option value="Apartment">Apartment</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Bungalow">Bungalow</option>
          </select>

          <label>Min Price:</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 300000"
          />

          <label>Max Price:</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 800000"
          />

          <label>Min Bedrooms:</label>
          <input
            type="number"
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(e.target.value)}
            placeholder="e.g. 2"
          />

          <label>Max Bedrooms:</label>
          <input
            type="number"
            value={maxBedrooms}
            onChange={(e) => setMaxBedrooms(e.target.value)}
            placeholder="e.g. 4"
          />

          <label>Added After:</label>
          <input
            type="date"
            value={afterDate}
            onChange={(e) => setAfterDate(e.target.value)}
          />

          <label>Added Before:</label>
          <input
            type="date"
            value={beforeDate}
            onChange={(e) => setBeforeDate(e.target.value)}
          />

          <label>Postcode Area:</label>
          <input
            type="text"
            id="postcodeArea"
            value={postcodeArea}
            onChange={(e) => setPostcodeArea(e.target.value)}
            placeholder="e.g. BR1"
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
                <p className="added-date">
                  <strong>Added:</strong> {property.added.day} {property.added.month} {property.added.year}
                </p>
                <a href={property.url} className="details-link">View Details</a>
                <button
                  className={`fav-btn ${favourites.includes(property.id) ? "active" : ""}`}
                  onClick={() => toggleFavourite(property.id)}
                >
                  {favourites.includes(property.id) ? "♥ Remove Favourite" : "♡ Add Favourite"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Favourites Section */}
      {favourites.length > 0 && (
        <section className="properties">
          <h2 className="section-title">My Favourites</h2>
          <div className="property-list">
            {propertiesData.properties
              .filter((p) => favourites.includes(p.id))
              .map((property) => (
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
                    <button
                      className="fav-btn active"
                      onClick={() => toggleFavourite(property.id)}
                    >
                      ♥ Remove Favourite
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;