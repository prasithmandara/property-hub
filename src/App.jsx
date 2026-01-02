import React, { useState, useEffect, useMemo } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import headerImage from "./assets/house.jpg";
import propertiesData from "./data/properties.json";

// Security: HTML encoding utility
const encodeHTML = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

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
      <div className="gallery">
        {property.images?.map((img, idx) => (
          <img key={idx} src={`/${img}`} alt={`${property.type} ${idx + 1}`} />
        ))}
      </div>
      <div className="property-info">
        <h3>{property.type} - {property.bedrooms} Bedrooms</h3>
        <p className="price">£{property.price.toLocaleString()}</p>
        <p className="location">{property.location}</p>
        <p className="tenure"><strong>Tenure:</strong> {property.tenure}</p>
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
              <iframe src={property.mapEmbed} width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy" title="Map"></iframe>
            ) : (
              <p>No map available.</p>
            )}
          </TabPanel>
        </Tabs>
        <div className="property-actions">
          <a href={property.url} className="details-link">View Details</a>
          <button className={`fav-btn ${isFavourite ? "active" : ""}`} onClick={() => toggleFavourite(property.id)}>
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

  useEffect(() => { setFavourites([]); }, []);

  const getPropertyDate = (added) => {
    if (typeof added === "string") return new Date(added);
    return new Date(`${added.month} ${added.day}, ${added.year}`);
  };

  const toggleFavourite = (propertyId) => {
    setFavourites((prev) => prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]);
  };

  const removeFavourite = (propertyId) => {
    setFavourites((prev) => prev.filter((id) => id !== propertyId));
  };

  const clearFavourites = () => setFavourites([]);

  const handleDragStartFromFavourites = (e, propertyId) => {
    setDraggedPropertyId(propertyId);
    e.dataTransfer.setData("propertyId", propertyId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropIntoFavourites = (e) => {
    e.preventDefault();
    const propertyId = e.dataTransfer.getData("propertyId");
    if (propertyId && !favourites.includes(propertyId)) {
      setFavourites((prev) => [...prev, propertyId]);
    }
    setDraggedPropertyId(null);
  };

  const handleDragOverFavourites = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDropOutsideFavourites = (e) => {
    e.preventDefault();
    const propertyId = e.dataTransfer.getData("propertyId");
    if (propertyId && favourites.includes(propertyId)) removeFavourite(propertyId);
    setDraggedPropertyId(null);
  };

  const handleDragOverOutside = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Subscribed: ${encodeHTML(email)}`);
    setEmail("");
  };

  const filteredProperties = useMemo(() => {
    return propertiesData.properties.filter((property) => {
      const matchesType = filterType === "any" || property.type.toLowerCase() === filterType.toLowerCase();
      const matchesMinPrice = minPrice === "" || property.price >= parseInt(minPrice, 10);
      const matchesMaxPrice = maxPrice === "" || property.price <= parseInt(maxPrice, 10);
      const matchesMinBedrooms = minBedrooms === "" || property.bedrooms >= parseInt(minBedrooms, 10);
      const matchesMaxBedrooms = maxBedrooms === "" || property.bedrooms <= parseInt(maxBedrooms, 10);
      const propertyDate = getPropertyDate(property.added);
      const matchesAfterDate = afterDate === "" || propertyDate >= new Date(afterDate);
      const matchesBeforeDate = beforeDate === "" || propertyDate <= new Date(beforeDate);
      const matchesPostcode = postcodeArea === "" || property.location.toUpperCase().startsWith(postcodeArea.toUpperCase());
      return matchesType && matchesMinPrice && matchesMaxPrice && matchesMinBedrooms && matchesMaxBedrooms && matchesAfterDate && matchesBeforeDate && matchesPostcode;
    });
  }, [filterType, minPrice, maxPrice, minBedrooms, maxBedrooms, afterDate, beforeDate, postcodeArea]);

  const favouriteProperties = propertiesData.properties.filter((p) => favourites.includes(p.id));

  return (
    <div className="app">
      <style>{`*{margin:0;padding:0;box-sizing:border-box}body{font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;background:#f4f4f9;color:#333;line-height:1.6}.app{min-height:100vh;display:flex;flex-direction:column}.navbar{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#2c3e50 0%,#34495e 100%);padding:1.2rem 2rem;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.3);position:sticky;top:0;z-index:1000}.logo{font-size:1.8rem;font-weight:700;letter-spacing:1px;text-shadow:2px 2px 4px rgba(0,0,0,.2)}.nav-links{list-style:none;display:flex;gap:2rem;align-items:center}.nav-links li{display:inline-block}.nav-links a{text-decoration:none;color:#fff;font-weight:500;font-size:1.05rem;transition:all .3s;padding:.5rem 1rem;border-radius:4px}.nav-links a:hover{background:rgba(255,255,255,.1);color:#3498db}.mobile-menu-toggle{display:none;background:0 0;border:none;color:#fff;font-size:1.8rem;cursor:pointer;padding:.5rem}.header{margin:2rem;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.25)}.header-photo{width:100%;height:450px;object-fit:cover;display:block}.main-content{display:flex;gap:2rem;padding:2rem;flex:1;align-items:flex-start}.properties{flex:1;min-width:0}.section-title{font-size:2.2rem;margin-bottom:1.5rem;color:#2c3e50;font-weight:700;text-align:left;border-bottom:3px solid #3498db;padding-bottom:.5rem}.filter-section{background:#fff;padding:2rem;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.1);margin-bottom:2rem}.filter-title{font-size:1.3rem;font-weight:600;color:#2c3e50;margin-bottom:1.5rem;text-align:left;display:flex;align-items:center;gap:.5rem}.filter-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-bottom:1.5rem}.filter-group{display:flex;flex-direction:column;gap:.5rem;text-align:left}.filter-group label{font-weight:600;color:#2c3e50;font-size:.95rem}.filter-group input,.filter-group select{padding:.7rem;border-radius:6px;border:2px solid #e0e0e0;font-size:.95rem;transition:all .3s;background:#fafafa}.filter-group input:focus,.filter-group select:focus{outline:0;border-color:#3498db;background:#fff;box-shadow:0 0 0 3px rgba(52,152,219,.1)}.filter-group input:hover,.filter-group select:hover{border-color:#3498db}#postcodeArea{text-transform:uppercase}.filter-actions{display:flex;gap:1rem;justify-content:flex-end}.clear-filters{padding:.8rem 1.5rem;border-radius:6px;border:2px solid #3498db;background:#fff;color:#3498db;cursor:pointer;font-weight:600;transition:all .3s}.clear-filters:hover{background:#3498db;color:#fff;transform:translateY(-2px);box-shadow:0 4px 12px rgba(52,152,219,.3)}.property-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:2rem}.property-card{background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.1);overflow:hidden;text-align:left;transition:all .3s;display:flex;flex-direction:column;cursor:move}.property-card:hover{transform:translateY(-8px);box-shadow:0 12px 32px rgba(0,0,0,.15)}.gallery{display:flex;gap:.5rem;overflow-x:auto;padding:.5rem;background:#f8f9fa}.gallery img{height:140px;border-radius:8px;object-fit:cover;cursor:pointer;transition:transform .3s;flex-shrink:0}.gallery img:hover{transform:scale(1.05)}.property-info{padding:1.5rem;display:flex;flex-direction:column;gap:.8rem;flex:1}.property-info h3{font-size:1.4rem;color:#2c3e50;font-weight:700}.price{font-size:1.5rem;font-weight:700;color:#3498db}.location{font-size:1rem;color:#555;display:flex;align-items:center;gap:.3rem}.location::before{content:"📍"}.tenure{font-size:.95rem;color:#666}.description{font-size:.9rem;color:#555;line-height:1.6}.floorplan{width:100%;max-height:400px;object-fit:contain;margin-top:1rem;border:1px solid #ddd;border-radius:8px}.property-actions{display:flex;gap:.5rem;margin-top:auto}.delete-btn,.details-link,.fav-btn{flex:1;text-align:center;padding:.7rem;border-radius:6px;font-size:.95rem;font-weight:600;transition:all .3s;cursor:pointer}.details-link{text-decoration:none;color:#fff;background:#3498db;border:2px solid #3498db}.details-link:hover{background:#fff;color:#3498db;transform:translateY(-2px)}.fav-btn{background:#fff;border:2px solid #3498db;color:#3498db}.fav-btn:hover{background:#3498db;color:#fff}.fav-btn.active{background:#e74c3c;border-color:#e74c3c;color:#fff}.delete-btn{background:#e74c3c;border:2px solid #e74c3c;color:#fff}.delete-btn:hover{background:#c0392b;border-color:#c0392b;transform:translateY(-2px)}.favourites-sidebar{width:350px;background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.1);padding:1.5rem;position:sticky;top:100px;max-height:calc(100vh - 120px);overflow-y:auto;display:flex;flex-direction:column;gap:1rem}.favourites-sidebar.hidden{display:none}.sidebar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}.sidebar-title{font-size:1.3rem;font-weight:700;color:#2c3e50}.toggle-sidebar{background:#3498db;color:#fff;border:none;padding:.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600;transition:all .3s}.toggle-sidebar:hover{background:#2980b9;transform:scale(1.05)}.favourites-container{border:2px dashed #3498db;border-radius:8px;padding:1rem;min-height:150px;background:#f8f9ff;transition:all .3s}.favourites-container.drag-over{background:#e8f4fd;border-color:#2980b9}.favourites-container.drag-remove{background:#ffe6e6;border-color:#e74c3c}.compact-list{display:flex;flex-direction:column;gap:.8rem}.property-card-compact{display:flex;gap:1rem;background:#fff;border-radius:8px;padding:.8rem;box-shadow:0 2px 8px rgba(0,0,0,.1);cursor:move;transition:all .3s}.property-card-compact:hover{transform:translateX(5px);box-shadow:0 4px 12px rgba(0,0,0,.15)}.compact-image{width:80px;height:80px;object-fit:cover;border-radius:6px;flex-shrink:0}.compact-info{flex:1;display:flex;flex-direction:column;gap:.3rem;position:relative}.compact-info h4{font-size:.95rem;color:#2c3e50;font-weight:600}.compact-price{font-size:1.1rem;font-weight:700;color:#3498db}.compact-location{font-size:.85rem;color:#666}.compact-remove{position:absolute;top:0;right:0;background:#e74c3c;color:#fff;border:none;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:.8rem;display:flex;align-items:center;justify-content:center;transition:all .3s}.compact-remove:hover{background:#c0392b;transform:scale(1.1)}.clear-btn{padding:.7rem 1.2rem;border-radius:6px;border:none;background:#e74c3c;color:#fff;cursor:pointer;font-weight:600;transition:all .3s}.clear-btn:hover{background:#c0392b;transform:translateY(-2px);box-shadow:0 4px 12px rgba(231,76,60,.3)}.empty-state{text-align:center;color:#999;padding:2rem;font-style:italic}.drag-hint{text-align:center;color:#666;font-size:.85rem;font-style:italic;margin-top:.5rem}.footer{background:linear-gradient(135deg,#1a252f 0%,#2c3e50 100%);color:#ecf0f1;padding:3rem 2rem 1.5rem;margin-top:auto}.footer-content{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2.5rem;text-align:left;max-width:1200px;margin:0 auto}.footer-section h3,.footer-section h4{color:#fff;margin-bottom:1rem;font-weight:700}.footer-section li,.footer-section p,.footer-section ul{font-size:.95rem;line-height:1.8}.footer-section ul{list-style:none}.footer-section ul li{margin-bottom:.7rem}.footer-section a{text-decoration:none;color:#ecf0f1;transition:color .3s}.footer-section a:hover{color:#3498db}.newsletter-form{display:flex;gap:.5rem}.newsletter-form input{flex:1;padding:.7rem;border-radius:6px;border:none;font-size:.95rem}.newsletter-form button{padding:.7rem 1.2rem;border-radius:6px;border:none;background:#3498db;color:#fff;cursor:pointer;font-weight:600;transition:all .3s}.newsletter-form button:hover{background:#2980b9;transform:scale(1.05)}.footer-bottom{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.1);text-align:center}.footer-bottom p{font-size:.9rem;color:#bdc3c7}.react-tabs__tab-list{border-bottom:2px solid #e0e0e0;margin:1rem 0;padding:0;display:flex;gap:.5rem}.react-tabs__tab{border:none;background:0 0;padding:.7rem 1.2rem;cursor:pointer;border-radius:6px 6px 0 0;transition:all .3s;color:#666;font-weight:600}.react-tabs__tab:hover{background:#f0f0f0;color:#2c3e50}.react-tabs__tab--selected{background:#3498db;color:#fff;border-bottom:3px solid #2980b9}.react-tabs__tab-panel{padding:1rem 0}@media screen and (max-width:1024px){.main-content{flex-direction:column}.favourites-sidebar{width:100%;position:relative;top:0;max-height:none;order:-1}.property-list{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}.filter-grid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem}}@media screen and (max-width:768px){.navbar{padding:1rem}.logo{font-size:1.4rem}.nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:#2c3e50;flex-direction:column;padding:1rem;gap:0;box-shadow:0 4px 12px rgba(0,0,0,.3)}.nav-links.mobile-open{display:flex}.nav-links li{width:100%;text-align:center;padding:.8rem 0;border-bottom:1px solid rgba(255,255,255,.1)}.mobile-menu-toggle{display:block}.header{margin:1rem}.header-photo{height:250px}.main-content{padding:1rem;gap:1rem}.section-title{font-size:1.8rem}.filter-section{padding:1.5rem}.filter-grid{grid-template-columns:1fr}.filter-actions{flex-direction:column}.clear-filters{width:100%}.property-list{grid-template-columns:1fr}.gallery{padding:.3rem}.gallery img{height:100px}.property-info{padding:1rem}.property-info h3{font-size:1.2rem}.price{font-size:1.3rem}.property-actions{flex-direction:column}.favourites-sidebar{padding:1rem}.sidebar-title{font-size:1.1rem}.toggle-sidebar{font-size:.85rem;padding:.4rem .8rem}.footer-content{grid-template-columns:1fr;gap:2rem}.newsletter-form{flex-direction:column}}@media screen and (max-width:480px){.logo{font-size:1.2rem}.header-photo{height:200px}.section-title{font-size:1.5rem}.filter-section{padding:1rem}.filter-title{font-size:1.1rem}.property-card-compact{flex-direction:column}.compact-image{width:100%;height:150px}}`}</style>
      
      <nav className="navbar">
        <h2 className="logo">PROPERTY HUB</h2>
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <header className="header">
        <img src={headerImage} alt="Property" className="header-photo" />
      </header>

      <div className="main-content" onDrop={handleDropOutsideFavourites} onDragOver={handleDragOverOutside}>
        
        <aside className={`favourites-sidebar ${!showFavouritesPanel ? 'hidden' : ''}`} onDrop={handleDropIntoFavourites} onDragOver={handleDragOverFavourites}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">My Favourites ({favourites.length})</h3>
            <button className="toggle-sidebar" onClick={() => setShowFavouritesPanel(!showFavouritesPanel)}>
              {showFavouritesPanel ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className={`favourites-container ${draggedPropertyId && !favourites.includes(draggedPropertyId) ? 'drag-over' : ''} ${draggedPropertyId && favourites.includes(draggedPropertyId) ? 'drag-remove' : ''}`}>
            {favouriteProperties.length === 0 ? (
              <p className="empty-state">No favourites yet. Drag properties here!</p>
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

        <section className="properties">
          <h2 className="section-title">🏠 Available Properties</h2>
          
          <div className="filter-section">
            <h3 className="filter-title">🔍 Search & Filter</h3>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Property Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
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
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="100,000" />
              </div>
              <div className="filter-group">
                <label>Max Price (£)</label>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="500,000" />
              </div>
              <div className="filter-group">
                <label>Min Bedrooms</label>
                <input type="number" value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} placeholder="1" />
              </div>
              <div className="filter-group">
                <label>Max Bedrooms</label>
                <input type="number" value={maxBedrooms} onChange={(e) => setMaxBedrooms(e.target.value)} placeholder="5" />
              </div>
              <div className="filter-group">
                <label>Added After</label>
                <input type="date" value={afterDate} onChange={(e) => setAfterDate(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Added Before</label>
                <input type="date" value={beforeDate} onChange={(e) => setBeforeDate(e.target.value)} />
              </div>
              <div className="filter-group">
                <label>Postcode Area</label>
                <input type="text" id="postcodeArea" value={postcodeArea} onChange={(e) => setPostcodeArea(e.target.value)} placeholder="SW1" />
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
              <li>Email: support.propertyhub@gmail.com</li>
              <li>Phone: +44 20 1234 5678</li>
              <li>Address: 123 High Street, London</li>
            </ul>
          </div>
          <div className="footer-section newsletter">
            <h4>Newsletter</h4>
            <p>Subscribe for new listings and market updates.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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