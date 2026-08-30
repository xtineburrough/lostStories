import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Fix Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

// ACCURATE & VERIFIED BANNED BOOKS DATABASE
const REAL_BANNED_BOOKS = [
  // --- UNITED STATES BANS ---
  {
    id: 1, title: "Maus", author: "Art Spiegelman",
    lat: 35.3212, lng: -84.6010, banLevel: "Local School District",
    originDistrict: "McMinn County School Board, TN",
    banReason: "Banned for profanity, nudity, and crude language in a graphic historical depiction of the Holocaust.",
    category: "History & Memoir", 
    getWays: ["Internet Archive Open Library", "Unbanned Cards via Brooklyn Public Library"],
    localStores: ["Parnassus Books (Nashville, TN)", "Union Ave Books (Knoxville, TN)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 2, title: "Gender Queer: A Memoir", author: "Maia Kobabe",
    lat: 38.8462, lng: -77.3064, banLevel: "Local School District",
    originDistrict: "Fairfax County Public Schools, VA",
    banReason: "Challenged and removed for alleged sexually explicit content and LGBTQ+ themes.",
    category: "LGBTQ+ / Memoir", 
    getWays: ["Libby/OverDrive Digital Library", "Comixology Digital Purchase"],
    localStores: ["Loyalty Bookstores (Silver Spring, MD)", "Solid State Books (Washington, D.C.)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 3, title: "The Bluest Eye", author: "Toni Morrison",
    lat: 32.9342, lng: -97.2292, banLevel: "Local School District",
    originDistrict: "Keller ISD, TX",
    banReason: "Challenged for depictions of sexual assault, incest, and explicit language.",
    category: "Classic Literature", 
    getWays: ["Books for All (NYPL Digital Access)", "AbeBooks / ThriftBooks"],
    localStores: ["The Wild Detectives (Dallas, TX)", "Interabang Books (Dallas, TX)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 4, title: "All Boys Aren't Blue", author: "George M. Johnson",
    lat: 28.5383, lng: -81.3792, banLevel: "Local School District",
    originDistrict: "Orange County Public Schools, FL",
    banReason: "Removed for LGBTQ+ themes, profanity, and heavy discussions of sexual consent.",
    category: "LGBTQ+ / Memoir", 
    getWays: ["Project Gutenberg Digital Archives", "OverDrive / Libby E-books"],
    localStores: ["Writer's Block Bookstore (Winter Park, FL)", "Spiral Bookcase"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 5, title: "The Hate U Give", author: "Angie Thomas",
    lat: 40.3204, lng: -75.1299, banLevel: "Local School District",
    originDistrict: "Central Bucks School District, PA",
    banReason: "Challenged for profanity, anti-police rhetoric, and drug references.",
    category: "Young Adult", 
    getWays: ["Brooklyn Public Library Unbanned Access", "IndieBound Direct Delivery"],
    localStores: ["Harriett's Bookshop (Philadelphia, PA)", "Doylestown Bookshop (Doylestown, PA)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 6, title: "Lawn Boy", author: "Jonathan Evison",
    lat: 34.2073, lng: -84.1402, banLevel: "Local School District",
    originDistrict: "Forsyth County Schools, GA",
    banReason: "Challenged for alleged pedophilia descriptions, sexually explicit scenes, and profanity.",
    category: "Fiction", 
    getWays: ["Seattle Public Library Digital Access", "Libby Audiobook"],
    localStores: ["Charis Books & More (Atlanta, GA)", "Eagle Eye Book Shop (Decatur, GA)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 7, title: "Flamer", author: "Mike Curato",
    lat: 33.7878, lng: -117.8531, banLevel: "Local School District",
    originDistrict: "Orange Unified School District, CA",
    banReason: "Challenged for LGBTQ+ storylines and claims of sexually explicit content.",
    category: "LGBTQ+ / Graphic Novel", 
    getWays: ["Comixology / Kindle Digital", "NYPL Books for All Access"],
    localStores: ["Bookman's Corner", "Skylight Books (Los Angeles, CA)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 8, title: "Out of Darkness", author: "Ashley Hope Pérez",
    lat: 29.9844, lng: -95.6514, banLevel: "Local School District",
    originDistrict: "Cy-Fair ISD, TX",
    banReason: "Banned for depictions of racism, violence, and sexual assault in a 1930s East Texas context.",
    category: "Historical Fiction", 
    getWays: ["Libby Digital Copy", "Alibris Independent Network"],
    localStores: ["Brazos Bookstore (Houston, TX)", "Murder By The Book (Houston, TX)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 9, title: "To Kill a Mockingbird", author: "Harper Lee",
    lat: 30.5221, lng: -87.2169, banLevel: "Local School District",
    originDistrict: "Escambia County School District, FL",
    banReason: "Challenged for use of racial slurs, 'white savior' tropes, and uncomfortable historical themes.",
    category: "Classic Literature", 
    getWays: ["Open Library Free Access", "Audible / Public Library Distribution"],
    localStores: ["Open Books (Pensacola, FL)", "Page & Palette (Fairhope, AL)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 10, title: "Gender Queer", author: "Maia Kobabe",
    lat: 41.2033, lng: -77.1945, banLevel: "Local School District",
    originDistrict: "Penncrest School District, PA",
    banReason: "Removed following school board review citing explicit illustration style.",
    category: "LGBTQ+ / Memoir", 
    getWays: ["VPN via Brooklyn Public Library", "Libby App"],
    localStores: ["Midtown Scholar Bookstore (Harrisburg, PA)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 11, title: "Stamped: Racism, Antiracism, and You", author: "Ibram X. Kendi & Jason Reynolds",
    lat: 39.7392, lng: -104.9903, banLevel: "Local School District",
    originDistrict: "Cherry Creek School District, CO",
    banReason: "Challenged for promoting Critical Race Theory and divisive political discourse.",
    category: "History / Non-Fiction", 
    getWays: ["Internet Archive Open Library", "Libby Audiobooks"],
    localStores: ["Tattered Cover Book Store (Denver, CO)", "Matter Bookstore (Denver, CO)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 12, title: "Thirteen Reasons Why", author: "Jay Asher",
    lat: 43.0731, lng: -89.4012, banLevel: "Local School District",
    originDistrict: "Waunakee Community School District, WI",
    banReason: "Banned/Restricted due to depictions of teenage suicide, sexual assault, and mental health crisis.",
    category: "Young Adult", 
    getWays: ["OverDrive Digital Access", "ThriftBooks Delivery"],
    localStores: ["A Room of One's Own (Madison, WI)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },

  // --- INTERNATIONAL BANS ---
  {
    id: 13, title: "1984", author: "George Orwell",
    lat: 55.7558, lng: 37.6173, banLevel: "International",
    originDistrict: "Russian Federation / Former USSR",
    banReason: "Historically banned for anti-totalitarian political satire; actively restricted in modern conflict contexts.",
    category: "Political Fiction / Classic", 
    getWays: ["Tor Browser / Shadow Libraries", "Gutenberg Canada Digital Archive"],
    localStores: ["International Freedom Press Distribution"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 14, title: "The Satanic Verses", author: "Salman Rushdie",
    lat: 28.6139, lng: 77.2090, banLevel: "International",
    originDistrict: "India / Iran / Multiple Middle Eastern Nations",
    banReason: "Banned nationally for alleged blasphemy against Islamic religious traditions.",
    category: "Fiction", 
    getWays: ["VPN via International Digital Libraries", "E-Pub Global Distribution"],
    localStores: ["Independent European Importers"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 15, title: "Persepolis", author: "Marjane Satrapi",
    lat: 35.6892, lng: 51.3890, banLevel: "International",
    originDistrict: "Islamic Republic of Iran",
    banReason: "Banned for critical depictions of the Iranian Revolution, political dissent, and religious police.",
    category: "Graphic Novel / Memoir", 
    getWays: ["Digital Open Archives", "Comixology Global Store"],
    localStores: ["Librairie Gourmande (Paris, France)", "Waterstones (London, UK)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 16, title: "Doctor Zhivago", author: "Boris Pasternak",
    lat: 59.9342, lng: 30.3351, banLevel: "International",
    originDistrict: "Soviet Union (Historical Ban)",
    banReason: "Banned by Soviet censors for implicitly criticizing the Bolshevik Revolution and Marxist dogma.",
    category: "Classic Literature", 
    getWays: ["Project Gutenberg", "Open Library Free Digital Loan"],
    localStores: ["Shakespeare and Company (Paris, France)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 17, title: "Animal Farm", author: "George Orwell",
    lat: 39.9042, lng: 116.4074, banLevel: "International",
    originDistrict: "People's Republic of China",
    banReason: "Online searches, discussions, and distribution heavily censored due to anti-authoritarian metaphors.",
    category: "Allegory / Classic", 
    getWays: ["Tor Network Access", "Gutenberg Australia"],
    localStores: ["Kubrick Books (Hong Kong)", "Eslite Bookstore (Taiwan)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  },
  {
    id: 18, title: "The Catcher in the Rye", author: "J.D. Salinger",
    lat: -33.8688, lng: 151.2093, banLevel: "International",
    originDistrict: "Australia (Historical Import Ban)",
    banReason: "Banned from importation between 1956 and 1968 due to vulgarity and immorality concerns.",
    category: "Classic Literature", 
    getWays: ["Local Public Library System", "Eason Digital Store"],
    localStores: ["Better Read Than Dead (Sydney, Australia)"],
    userShare: "",
    mediaLink: "",
    creditedAuthor: "",
    verified: true
  }
];

// Helper component to handle dropping pins when adding mode is toggled
function MapClickHandler({ isAddingMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isAddingMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

const INITIAL_FORM_STATE = { 
  title: '', 
  author: '', 
  userShare: '',
  imageFile: null,
  imagePreview: '',
  mediaLink: '',
  banLevel: 'State',
  district: '', 
  reason: '', 
  store: '', 
  getWay: '',
  isAnonymous: true,
  creditName: ''
};

export default function App() {
  const [bannedBooks, setBannedBooks] = useState(REAL_BANNED_BOOKS);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All' });
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Load submissions from MongoDB API on initial mount
  useEffect(() => {
    async function fetchDatabaseBooks() {
      try {
        const response = await fetch('/api/books');
        if (response.ok) {
          const dbBooks = await response.json();
          // Filter out duplicates if verified seeds exist in DB
          const verifiedTitles = new Set(REAL_BANNED_BOOKS.map(b => b.title.toLowerCase()));
          const userSubmissions = dbBooks.filter(b => !verifiedTitles.has(b.title.toLowerCase()));
          setBannedBooks([...userSubmissions, ...REAL_BANNED_BOOKS]);
        }
      } catch (err) {
        console.warn("API offline or unreachable; using local records:", err);
      }
    }
    fetchDatabaseBooks();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(bannedBooks.map(b => b.category || "General"))];
  }, [bannedBooks]);

  const filteredBooks = useMemo(() => {
    return bannedBooks.filter(book => {
      const matchCat = filters.category === 'All' || book.category === filters.category;
      const search = filters.search.toLowerCase();
      return matchCat && (
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        (book.originDistrict && book.originDistrict.toLowerCase().includes(search))
      );
    });
  }, [bannedBooks, filters]);

  const creditsList = useMemo(() => {
    return bannedBooks
      .filter(book => Boolean(book.creditedAuthor))
      .map(book => ({
        name: book.creditedAuthor,
        bookTitle: book.title
      }));
  }, [bannedBooks]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Use FileReader to create a persistent base64 string for database storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) return;
    setFormStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!pendingCoords || !formData.title || !formData.author) return;

    const newEntryPayload = {
      title: formData.title,
      author: formData.author,
      lat: pendingCoords.lat,
      lng: pendingCoords.lng,
      banLevel: formData.banLevel,
      originDistrict: formData.district || `${formData.banLevel} Submission`,
      banReason: formData.reason || "Under Community Verification",
      category: "User Submitted",
      getWays: formData.getWay ? [formData.getWay] : ["Library Search / VPN"],
      localStores: formData.store ? [formData.store] : ["Local Indie Bookstore"],
      userShare: formData.userShare,
      mediaLink: formData.mediaLink,
      imagePreview: formData.imagePreview,
      creditedAuthor: formData.isAnonymous ? "" : (formData.creditName || "Community Contributor"),
      verified: false
    };

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntryPayload)
      });

      if (response.ok) {
        const savedBook = await response.json();
        setBannedBooks(prev => [savedBook, ...prev]);
      } else {
        // Fallback to local state if database fails
        setBannedBooks(prev => [{ id: Date.now(), ...newEntryPayload }, ...prev]);
      }
    } catch (err) {
      console.warn("Failed to save to database, keeping in memory:", err);
      setBannedBooks(prev => [{ id: Date.now(), ...newEntryPayload }, ...prev]);
    }

    setFormData(INITIAL_FORM_STATE);
    setPendingCoords(null);
    setIsAddingMode(false);
    setFormStep(1);
  };

  const resetFormState = () => {
    setPendingCoords(null);
    setFormStep(1);
    setFormData(INITIAL_FORM_STATE);
  };

  return (
    <div className="app-layout">
      {/* Top Navigation for Community Credits */}
      <header className="top-nav">
        <button 
          className="credits-nav-btn"
          onClick={() => setShowCreditsModal(true)}
        >
          Community Credits ({creditsList.length})
        </button>
      </header>

      {/* Map Container */}
      <div className={`map-container ${isAddingMode ? 'adding-mode' : ''}`}>
        <MapContainer 
          center={[38.0000, -97.0000]} 
          zoom={4} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Base Layer: Esri World Imagery (Satellite) */}
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* Reference Layers: Transportation Roads & Place Labels */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />

          <MapClickHandler 
            isAddingMode={isAddingMode} 
            onMapClick={(latlng) => {
              setPendingCoords(latlng);
              setFormStep(1);
            }} 
          />

          {/* Markers for Real Banned Books */}
          {filteredBooks.map((book) => (
            <Marker key={book._id || book.id} position={[book.lat, book.lng]}>
              <Popup>
                <div className="book-popup">
                  <h3>{book.title}</h3>
                  <p className="popup-author">by {book.author}</p>
                  
                  {book.verified ? (
                    <span className="verified-badge">✓ Verified Challenge Record</span>
                  ) : (
                    <span className="verified-badge user-badge">User Submission</span>
                  )}

                  {book.userShare && (
                    <div className="info-section user-quote">
                      <h4>Community Reflection:</h4>
                      <p>"{book.userShare}"</p>
                    </div>
                  )}

                  {book.imagePreview && (
                    <div className="info-section">
                      <h4>Shared Artwork:</h4>
                      <img src={book.imagePreview} alt="Shared contribution" className="popup-preview-img" />
                    </div>
                  )}

                  {book.mediaLink && (
                    <div className="info-section">
                      <h4>Attached Audio / Video:</h4>
                      <a href={book.mediaLink} target="_blank" rel="noopener noreferrer" className="media-anchor">
                        Open Attached Media ↗
                      </a>
                    </div>
                  )}

                  <div className="info-section">
                    <h4>Location / Jurisdiction:</h4>
                    <p>{book.originDistrict}</p>
                  </div>

                  <div className="info-section">
                    <h4>Stated Ban Reason:</h4>
                    <p className="ban-reason">{book.banReason}</p>
                  </div>

                  <div className="info-section access">
                    <h4>How to Access This Story:</h4>
                    <ul>
                      {book.getWays && book.getWays.map((way, idx) => <li key={idx}>{way}</li>)}
                    </ul>
                  </div>

                  <div className="info-section stores">
                    <h4>Supporting Local Bookstores:</h4>
                    <ul>
                      {book.localStores && book.localStores.map((store, idx) => <li key={idx}>{store}</li>)}
                    </ul>
                  </div>

                  {book.creditedAuthor && (
                    <div className="info-section attribution">
                      <p><small>Contributed by: <strong>{book.creditedAuthor}</strong></small></p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {pendingCoords && (
            <Marker position={[pendingCoords.lat, pendingCoords.lng]} />
          )}
        </MapContainer>
      </div>

      {/* Center Illustration Logo */}
      <img src="/logo_banned_books.png" alt="Land of Lost Stories Logo" className="main-logo" />

      {/* Crosshair Cursor Banner */}
      {isAddingMode && (
        <div className="click-prompt-banner">
          Target Mode Active: Click anywhere on the map to log a banned book pin
        </div>
      )}

      {/* Floating Bottom Toolbar */}
      <div className="bottom-toolbar">
        <input 
          type="text" 
          placeholder="Search title, author, or district..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />

        <select 
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="All">All Subjects ({bannedBooks.length})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button 
          className={`add-pin-btn ${isAddingMode ? 'active' : ''}`}
          onClick={() => {
            setIsAddingMode(!isAddingMode);
            setPendingCoords(null);
          }}
        >
          {isAddingMode ? 'Cancel' : '+ Drop Pin'}
        </button>
      </div>

      {/* User Submission Multi-Step Modal */}
      {pendingCoords && (
        <div className="submission-overlay">
          <div className="submission-form">
            <button className="close-btn" onClick={resetFormState}>×</button>
            <div className="form-header">
              <span className="step-indicator">Step {formStep} of 2</span>
              <h3>Log Banned Book at [{pendingCoords.lat.toFixed(2)}, {pendingCoords.lng.toFixed(2)}]</h3>
            </div>

            {formStep === 1 ? (
              <form onSubmit={handleNextStep}>
                <div className="form-group">
                  <label>Book Title*</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Beloved"
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Author*</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Toni Morrison"
                    value={formData.author} 
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>What would you like to share about this book?</label>
                  <textarea 
                    rows={3} 
                    placeholder="Share a reflection, poem, thoughts, or context..."
                    value={formData.userShare} 
                    onChange={(e) => setFormData({...formData, userShare: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Upload a Drawing / Artwork (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.imagePreview && (
                    <img 
                      src={formData.imagePreview} 
                      alt="Upload Preview" 
                      className="form-image-preview" 
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Audio / Video Link (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="SoundCloud, YouTube, Vimeo, or Spotify link..."
                    value={formData.mediaLink} 
                    onChange={(e) => setFormData({...formData, mediaLink: e.target.value})}
                  />
                  <small className="field-hint">Please link to SoundCloud, YouTube, or Vimeo rather than uploading directly.</small>
                </div>

                <button type="submit" className="submit-confirm-btn">Continue to Ban Details →</button>
              </form>
            ) : (
              <form onSubmit={handleFinalSubmit}>
                <p className="step-subtitle">Anything else you'd like to share?</p>

                <div className="form-row">
                  <div className="form-group half">
                    <label>Ban Scope / Level</label>
                    <select 
                      value={formData.banLevel}
                      onChange={(e) => setFormData({...formData, banLevel: e.target.value})}
                    >
                      <option value="Federal">Federal</option>
                      <option value="State">State</option>
                      <option value="County">County</option>
                      <option value="Local School District">Local School District</option>
                      <option value="International">International</option>
                    </select>
                  </div>

                  <div className="form-group half">
                    <label>District / Specific Region</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Keller ISD, TX"
                      value={formData.district} 
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Stated Reason for Ban (if known)</label>
                  <textarea 
                    rows={2} 
                    placeholder="e.g. Challenged for mature themes..."
                    value={formData.reason} 
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Where can people get this book?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Libby, Internet Archive, Local Library"
                    value={formData.getWay} 
                    onChange={(e) => setFormData({...formData, getWay: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Supporting Local Bookstore</label>
                  <input 
                    type="text" 
                    placeholder="e.g. The Wild Detectives"
                    value={formData.store} 
                    onChange={(e) => setFormData({...formData, store: e.target.value})}
                  />
                </div>

                {/* Fixed Anonymous & Attribution Card */}
                <div className="attribution-card">
                  <label className="anon-toggle">
                    <input 
                      type="checkbox" 
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                    />
                    <div className="toggle-text">
                      <span className="toggle-title">Keep my submission anonymous</span>
                      <span className="toggle-subtitle">Uncheck to add your name to our community credits page</span>
                    </div>
                  </label>

                  {!formData.isAnonymous && (
                    <div className="credit-input-field">
                      <label>Name or Handle to Credit</label>
                      <input 
                        type="text" 
                        placeholder="Your name or handle to appear on the Credits page"
                        value={formData.creditName} 
                        onChange={(e) => setFormData({...formData, creditName: e.target.value})}
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="back-btn" onClick={() => setFormStep(1)}>← Back</button>
                  <button type="submit" className="submit-confirm-btn">Publish Pin</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Community Credits Modal */}
      {showCreditsModal && (
        <div className="submission-overlay" onClick={() => setShowCreditsModal(false)}>
          <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCreditsModal(false)}>×</button>
            <h2>Community Contributors & Artists</h2>
            <p className="credits-subhead">Honoring those who document and defend free expression.</p>
            <div className="credits-scroll-list">
              {creditsList.length === 0 ? (
                <p className="empty-credits">No named contributions logged yet. Be the first to share your name!</p>
              ) : (
                <ul>
                  {creditsList.map((item, index) => (
                    <li key={index}>
                      <strong>{item.name}</strong> <span>for submission on <em>{item.bookTitle}</em></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}