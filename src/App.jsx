import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import headerImage from "./assets/house.jpg";
import propertiesData from "./data/properties.json";

// Reusable PropertyCard component
function PropertyCard({ property, isFavourite, toggleFavourite }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("propertyId", property.id);
  };

  return (
    <div className="property-card" draggable onDragStart={handleDragStart}>
      {/* Image Gallery */}
      <div className="gallery">
        {property.images &&
          property.images.map((img, idx) => (
            <img key={idx} src={`/${img}`} alt={`${property.type} ${idx + 1}`} />
          ))}
      </div>

      <div className="property-info">
        <h3>
          {property.type} - {property.bedrooms} Bedrooms
        </h3>
        <p className="price">£{property.price.toLocaleString()}</p>
        <p className="location">{property.location}</p>
        <p className="tenure">
          <strong>Tenure:</strong> {property.tenure}
        </p>

        {/* Tabs for Description, Floor Plan, Map */}
        <Tabs>
          <TabList>
            <Tab>Description</Tab>
            <Tab>Floor Plan</Tab>
            <Tab>Map</Tab>
          </TabList>

          <TabPanel>
            <p className="description">{property.description}</p>
          </TabPanel>

          <TabPanel>
            {property.floorPlan ? (
              <img
                src={`/${property.floorPlan}`}
                alt="Floor Plan"
                className="floorplan"
              />
            ) : (
              <p>No floor plan available.</p>
            )}
          </TabPanel>

          <TabPanel>
            {property.mapEmbed ? (
              <iframe
                src={property.mapEmbed}
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Google Map"
              ></iframe>
            ) : (
              <p>No map available.</p>
            )}
          </TabPanel>
        </Tabs>

        {/* Actions */}
        <div className="property-actions">
          <a href={property.url} className="details-link">
            View Details
          </a>
          <button
            className={`fav-btn ${isFavourite ? "active" : ""}`}
            onClick={() => toggleFavourite(property.id)}
            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            {isFavourite ? "♥ Favourite" : "♡ Favourite"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    if (typeof added === "string") return new Date(added);
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

  // Handle drop into favourites
  const handleDrop = (e) => {
    e.preventDefault();
    const propertyId = e.dataTransfer.getData("propertyId");
    if (propertyId && !favourites.includes(propertyId)) {
      setFavourites((prev) => [...prev, propertyId]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Filter properties
  const filteredProperties = useMemo(() => {
    return propertiesData.properties.filter((property) => {
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
  }, [
    filterType,
    minPrice,
    maxPrice,
    minBedrooms,
    maxBedrooms,
    afterDate,
    beforeDate,
    postcodeArea,
  ]);

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

      <div className="main-content">
        {/* Properties Section */}
        <section className="properties">
          <h2 className="section-title">Available Properties</h2>

          {/* Filter Bar */}
          <div className="filter-bar">
            <label>Type:</label>
            <select
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

            <label>Min Price:</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="e.g. 100000"
            />

            <label>Max Price:</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 500000"
            />

            <label>Min Bedrooms:</label>
            <input
              type="number"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              placeholder="e.g. 1"
            />

            <label>Max Bedrooms:</label>
            <input
              type="number"
              value={maxBedrooms}
              onChange={(e) => setMaxBedrooms(e.target.value)}
              placeholder="e.g. 5"
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
              value={postcodeArea}
              onChange={(e) => setPostcodeArea(e.target.value)}
              placeholder="e.g. SW1"
            />

            <button
              className="clear-filters"
              onClick={() => {
                setFilterType("any");
                setMinPrice("");
                setMaxPrice("");
                setMinBedrooms("");
                setMaxBedrooms("");
                setAfterDate("");
                setBeforeDate("");
                setPostcodeArea("");
              }}
            >
              Clear Filters
            </button>
          </div>

          <div className="property-list">
            {filteredProperties.length === 0 ? (
              <p className="empty-state">No properties match your filters.</p>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavourite={favourites.includes(property.id)}
                  toggleFavourite={toggleFavourite}
                />
              ))
            )}
          </div>
        </section>

        {/* Favourites Section with drag-and-drop */}
        <section
          className="favourites"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <h2 className="section-title">My Favourites</h2>
          <div className="property-list">
            {propertiesData.properties
              .filter((p) => favourites.includes(p.id))
              .map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavourite={true}
                  toggleFavourite={toggleFavourite}
                />
              ))}
          </div>
          <p className="drag-hint">Drag properties here to add to favourites</p>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>PROPERTY HUB</h3>
            <p>Your trusted platform for finding the perfect home.</p>
          </div>

          <div className="footer-section links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#favourites">Favourites</a></li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h4>Contact</h4>
            <ul>
              <li>Email: support@propertyhub.example</li>
              <li>Phone: +44 20 1234 5678</li>
              <li>Address: 123 High Street, London</li>
            </ul>
          </div>

          <div className="footer-section newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe for new listings and market updates.</p>
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed!");
              }}
            >
              <input type="email" placeholder="Your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Property Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;