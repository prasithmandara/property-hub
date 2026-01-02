import React, { useState, useEffect, useMemo } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import headerImage from "./assets/house.jpeg";
import propertiesData from "./data/properties.json";

// Security: HTML encoding utility
const encodeHTML = (str) => {
  if (!str) return '';
  return String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
};

// Image Carousel Component
function ImageCarousel({ images, propertyType }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious();
    }
  };

  return (
    <div className="carousel-container">
      <div 
        className="carousel-slide"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={`/${images[currentIndex]}`} 
          alt={`${propertyType} ${currentIndex + 1}`}
          className="carousel-image"
        />
        
        {images.length > 1 && (
          <>
            <button className="carousel-btn carousel-btn-prev" onClick={goToPrevious} aria-label="Previous image">
              ‹
            </button>
            <button className="carousel-btn carousel-btn-next" onClick={goToNext} aria-label="Next image">
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="carousel-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

// Compact PropertyCard for Sidebar
function PropertyCardCompact({ property, removeFavourite }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("propertyId", property.id);
  };

  return (
    <div className="property-card-compact" draggable onDragStart={handleDragStart}>
      <img src={`/${property.images[0]}`} alt={property.type} className="compact-image" />
      <div className="compact-info">
        <h4>{property.type} - {property.bedrooms} Bed</h4>
        <p className="compact-price">£{property.price.toLocaleString()}</p>
        <p className="compact-location">{property.location}</p>
        <button className="compact-remove" onClick={() => removeFavourite(property.id)} aria-label="Remove">✖</button>
      </div>
    </div>
  );
}

// Full PropertyCard
function PropertyCard({ property, isFavourite, toggleFavourite, removeFavourite, showDelete }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("propertyId", property.id);
  };

  return (
    <div className="property-card" draggable onDragStart={handleDragStart}>
      {/* Image Carousel */}
      {property.images && property.images.length > 0 && (
        <ImageCarousel images={property.images} propertyType={property.type} />
      )}

      <div className="property-info">
        <h3>{property.type} - {property.bedrooms} Bedrooms</h3>
        <p className="price">£{property.price.toLocaleString()}</p>
        <p className="location">{property.location}</p>
        <p className="tenure"><strong>Tenure:</strong> {property.tenure}</p>

        {/*Tabs for Description, Floor Plan, Map*/}
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
              <img src={`/${property.floorPlan}`} alt="Floor Plan" className="floorplan" />
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
                title="Map"
              ></iframe>
            ) : (
              <p>No map available.</p>
            )}
          </TabPanel>
        </Tabs>

        {/*Actions*/}
        <div className="property-actions">
          <button 
            className={`fav-btn ${isFavourite ? "active" : ""}`}
            onClick={() => toggleFavourite(property.id)}>
            {isFavourite ? "♥ Favourite" : "♡ Favourite"}
          </button>
          {showDelete && <button className="delete-btn" onClick={() => removeFavourite(property.id)}>✖ Remove</button>}
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
  const [draggedPropertyId, setDraggedPropertyId] = useState(null);
  const [email, setEmail] = useState("");
  const [showFavouritesPanel, setShowFavouritesPanel] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  //initialize with empty favourites array
  useEffect(() =>
    { setFavourites([]);
  }, []);

  //convert property "added" object to JS Date
  const getPropertyDate = (added) => {
    if (typeof added === "string") return new Date(added);
    return new Date(`${added.month} ${added.day}, ${added.year}`);
  };

  // Toggle favourites
  const toggleFavourite = (propertyId) => {
    setFavourites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Remove favourite explicitly
  const removeFavourite = (propertyId) => {
    setFavourites((prev) =>
      prev.filter((id) => id !== propertyId)
    );
  };

  // Clear all favourites
  const clearFavourites = () => setFavourites([]);

  // Handle drag start - store the dragged property ID
  const handleDragStartFromFavourites = (e, propertyId) => {
    setDraggedPropertyId(propertyId);
    e.dataTransfer.setData("propertyId", propertyId);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drop into favourites section
  const handleDropIntoFavourites = (e) => {
    e.preventDefault();
    const propertyId = e.dataTransfer.getData("propertyId");
    if (propertyId && !favourites.includes(propertyId)) {
      setFavourites((prev) => [...prev, propertyId]);
    }
    setDraggedPropertyId(null);
  };

  // Handle drag over favourites section
  const handleDragOverFavourites = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle drop outside favourites (remove from favourites)
  const handleDropOutsideFavourites = (e) => {
    e.preventDefault();
    const propertyId = e.dataTransfer.getData("propertyId");
    if (propertyId && favourites.includes(propertyId)){
      removeFavourite(propertyId);
    }
    setDraggedPropertyId(null);
  };

  // Handle drag over outside favourites
  const handleDragOverOutside = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Subscribed: ${encodeHTML(email)}`);
    setEmail("");
  };

  // Filter properties
  const filteredProperties = useMemo(() => {
    return propertiesData.properties.filter((property) => {
      const matchesType =
        filterType === "any" || property.type.toLowerCase() === filterType.toLowerCase();

      const matchesMinPrice = 
        minPrice === "" || property.price >= parseInt(minPrice, 10);

      const matchesMaxPrice = 
        maxPrice === "" || property.price <= parseInt(maxPrice, 10);

      const matchesMinBedrooms =
        minBedrooms === "" || property.bedrooms >= parseInt(minBedrooms, 10);

      const matchesMaxBedrooms =
        maxBedrooms === "" || property.bedrooms <= parseInt(maxBedrooms, 10);

      const propertyDate =
        getPropertyDate(property.added);

      const matchesAfterDate =
        afterDate === "" || propertyDate >= new Date(afterDate);

      const matchesBeforeDate =
        beforeDate === "" || propertyDate <= new Date(beforeDate);

      const matchesPostcode =
        postcodeArea === "" || property.location.toUpperCase().startsWith(postcodeArea.toUpperCase());

      return(
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
    postcodeArea
  ]);

  const favouriteProperties =
    propertiesData.properties.filter((p) => favourites.includes(p.id));

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <h2 className="logo">PROPERTY HUB</h2>
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Header Section */}
      <header className="header">
        <img src={headerImage} alt="Property" className="header-photo" />
      </header>

      <div
        className="main-content"
        onDrop={handleDropOutsideFavourites}
        onDragOver={handleDragOverOutside}
      >
        
        <aside className={`favourites-sidebar ${!showFavouritesPanel ? 'hidden' : ''}`} onDrop={handleDropIntoFavourites} onDragOver={handleDragOverFavourites}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">My Favourites ({favourites.length})</h3>
          </div>
          <div className={`favourites-container ${draggedPropertyId && !favourites.includes(draggedPropertyId) ? 'drag-over' : ''} ${draggedPropertyId && favourites.includes(draggedPropertyId) ? 'drag-remove' : ''}`}>
            {favouriteProperties.length === 0 ? (
              <p className="empty-state">No favourites yet.</p>
            ) : (
              <div className="compact-list">
                {favouriteProperties.map((property) => (
                  <PropertyCardCompact key={property.id} property={property} removeFavourite={removeFavourite} />
                ))}
              </div>
            )}
          </div>
          {favourites.length > 0 && <button className="clear-btn" onClick={clearFavourites}>Clear All</button>}
          <p className="drag-hint">💡 Drag to add or remove</p>
        </aside>

        {/* Properties Section */}
        <section className="properties">
          <h2 className="section-title">🏠 Available Properties</h2>

          {/* Filter Bar */}
          <div className="filter-section">
            <h3 className="filter-title">🔍 Search & Filter</h3>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Property Type</label>
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
              </div>

              <div className="filter-group">
                <label>Min Price (£)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="100,000"
                />
              </div>

              <div className="filter-group">
                <label>Max Price (£)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="500,000"
                />
              </div>

              <div className="filter-group">
                <label>Min Bedrooms</label>
                <input
                  type="number"
                  value={minBedrooms} 
                  onChange={(e) => setMinBedrooms(e.target.value)} 
                  placeholder="1"
                />
              </div>

              <div className="filter-group">
                <label>Max Bedrooms</label>
                <input
                  type="number"
                  value={maxBedrooms}
                  onChange={(e) => setMaxBedrooms(e.target.value)}
                  placeholder="5"
                />
              </div>

              <div className="filter-group">
                <label>Added After</label>
                <input
                  type="date" value={afterDate}
                  onChange={(e) => setAfterDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Added Before</label>
                <input
                  type="date"
                  value={beforeDate}
                  onChange={(e) => setBeforeDate(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Postcode Area</label>
                <input
                  type="text"
                  id="postcodeArea"
                  value={postcodeArea}
                  onChange={(e) => setPostcodeArea(e.target.value)}
                  placeholder="BR1"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="clear-filters" onClick={() => {
                setFilterType("any");
                setMinPrice("");
                setMaxPrice("");
                setMinBedrooms("");
                setMaxBedrooms("");
                setAfterDate("");
                setBeforeDate("");
                setPostcodeArea("");
              }}>
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="property-list">
            {filteredProperties.length === 0 ? (
              <p className="empty-state">No properties match your filters. Try adjusting your search criteria.</p>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavourite={favourites.includes(property.id)}
                  toggleFavourite={toggleFavourite}
                  removeFavourite={removeFavourite}
                  showDelete={false}
                />
              ))
            )}
          </div>
        </section>
      </div>
 
      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>PROPERTY HUB</h3>
            <p>Your Trusted Platform for Finding the Perfect Home.</p>
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
            <p>Subscribe for New Listings and Market Updates.</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button onClick={handleSubscribe}>Subscribe</button>
            </div>
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