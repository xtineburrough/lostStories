import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import L from 'leaflet';
import './App.css';

// ==========================================
// ICON CREDITS & ATTRIBUTION
// Pirate flag Icon by Lee Mette from Noun Project (CC BY 3.0)
// No reading Icon by Muhammad Riza from Noun Project (CC BY 3.0)
// ==========================================

const PirateIcon = L.icon({ 
  iconUrl: '/pirate-flag.png', // Ensure this is saved in your /public folder
  iconSize: [32, 32], 
  iconAnchor: [16, 32] 
});

const NoReadingIcon = L.icon({ 
  iconUrl: '/no-reading.png', // Ensure this is saved in your /public folder
  iconSize: [32, 32], 
  iconAnchor: [16, 32] 
});

// Basic Bad Word Filter for Dev Review
const BAD_WORDS = ['slur1', 'slur2', 'badword', 'bitch', 'fuck', 'shit']; 
const checkProfanity = (text) => {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

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
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 2, title: "Gender Queer: A Memoir", author: "Maia Kobabe",
    lat: 38.8462, lng: -77.3064, banLevel: "Local School District",
    originDistrict: "Fairfax County Public Schools, VA",
    banReason: "Challenged and removed for alleged sexually explicit content and LGBTQ+ themes.",
    category: "LGBTQ+ / Memoir", 
    getWays: ["Libby/OverDrive Digital Library", "Comixology Digital Purchase"],
    localStores: ["Loyalty Bookstores (Silver Spring, MD)", "Solid State Books (Washington, D.C.)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 3, title: "The Bluest Eye", author: "Toni Morrison",
    lat: 32.9342, lng: -97.2292, banLevel: "Local School District",
    originDistrict: "Keller ISD, TX",
    banReason: "Challenged for depictions of sexual assault, incest, and explicit language.",
    category: "Classic Literature", 
    getWays: ["Books for All (NYPL Digital Access)", "AbeBooks / ThriftBooks"],
    localStores: ["The Wild Detectives (Dallas, TX)", "Interabang Books (Dallas, TX)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 4, title: "All Boys Aren't Blue", author: "George M. Johnson",
    lat: 28.5383, lng: -81.3792, banLevel: "Local School District",
    originDistrict: "Orange County Public Schools, FL",
    banReason: "Removed for LGBTQ+ themes, profanity, and heavy discussions of sexual consent.",
    category: "LGBTQ+ / Memoir", 
    getWays: ["Project Gutenberg Digital Archives", "OverDrive / Libby E-books"],
    localStores: ["Writer's Block Bookstore (Winter Park, FL)", "Spiral Bookcase"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 5, title: "The Hate U Give", author: "Angie Thomas",
    lat: 40.3204, lng: -75.1299, banLevel: "Local School District",
    originDistrict: "Central Bucks School District, PA",
    banReason: "Challenged for profanity, anti-police rhetoric, and drug references.",
    category: "Young Adult", 
    getWays: ["Brooklyn Public Library Unbanned Access", "IndieBound Direct Delivery"],
    localStores: ["Harriett's Bookshop (Philadelphia, PA)", "Doylestown Bookshop (Doylestown, PA)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 6, title: "Lawn Boy", author: "Jonathan Evison",
    lat: 34.2073, lng: -84.1402, banLevel: "Local School District",
    originDistrict: "Forsyth County Schools, GA",
    banReason: "Challenged for alleged pedophilia descriptions, sexually explicit scenes, and profanity.",
    category: "Fiction", 
    getWays: ["Seattle Public Library Digital Access", "Libby Audiobook"],
    localStores: ["Charis Books & More (Atlanta, GA)", "Eagle Eye Book Shop (Decatur, GA)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 7, title: "Flamer", author: "Mike Curato",
    lat: 33.7878, lng: -117.8531, banLevel: "Local School District",
    originDistrict: "Orange Unified School District, CA",
    banReason: "Challenged for LGBTQ+ storylines and claims of sexually explicit content.",
    category: "LGBTQ+ / Graphic Novel", 
    getWays: ["Comixology / Kindle Digital", "NYPL Books for All Access"],
    localStores: ["Bookman's Corner", "Skylight Books (Los Angeles, CA)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 8, title: "Out of Darkness", author: "Ashley Hope Pérez",
    lat: 29.9844, lng: -95.6514, banLevel: "Local School District",
    originDistrict: "Cy-Fair ISD, TX",
    banReason: "Banned for depictions of racism, violence, and sexual assault in a 1930s East Texas context.",
    category: "Historical Fiction", 
    getWays: ["Libby Digital Copy", "Alibris Independent Network"],
    localStores: ["Brazos Bookstore (Houston, TX)", "Murder By The Book (Houston, TX)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 9, title: "To Kill a Mockingbird", author: "Harper Lee",
    lat: 30.5221, lng: -87.2169, banLevel: "Local School District",
    originDistrict: "Escambia County School District, FL",
    banReason: "Challenged for use of racial slurs, 'white savior' tropes, and uncomfortable historical themes.",
    category: "Classic Literature", 
    getWays: ["Open Library Free Access", "Audible / Public Library Distribution"],
    localStores: ["Open Books (Pensacola, FL)", "Page & Palette (Fairhope, AL)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 10, title: "Gender Queer", author: "Maia Kobabe",
    lat: 41.2033, lng: -77.1945, banLevel: "Local School District",
    originDistrict: "Penncrest School District, PA",
    banReason: "Removed following school board review citing explicit illustration style.",
    category: "LGBTQ+ / Memoir", 
    getWays: ["VPN via Brooklyn Public Library", "Libby App"],
    localStores: ["Midtown Scholar Bookstore (Harrisburg, PA)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 11, title: "Stamped: Racism, Antiracism, and You", author: "Ibram X. Kendi & Jason Reynolds",
    lat: 39.7392, lng: -104.9903, banLevel: "Local School District",
    originDistrict: "Cherry Creek School District, CO",
    banReason: "Challenged for promoting Critical Race Theory and divisive political discourse.",
    category: "History / Non-Fiction", 
    getWays: ["Internet Archive Open Library", "Libby Audiobooks"],
    localStores: ["Tattered Cover Book Store (Denver, CO)", "Matter Bookstore (Denver, CO)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 12, title: "Thirteen Reasons Why", author: "Jay Asher",
    lat: 43.0731, lng: -89.4012, banLevel: "Local School District",
    originDistrict: "Waunakee Community School District, WI",
    banReason: "Banned/Restricted due to depictions of teenage suicide, sexual assault, and mental health crisis.",
    category: "Young Adult", 
    getWays: ["OverDrive Digital Access", "ThriftBooks Delivery"],
    localStores: ["A Room of One's Own (Madison, WI)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
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
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 14, title: "The Satanic Verses", author: "Salman Rushdie",
    lat: 28.6139, lng: 77.2090, banLevel: "International",
    originDistrict: "India / Iran / Multiple Middle Eastern Nations",
    banReason: "Banned nationally for alleged blasphemy against Islamic religious traditions.",
    category: "Fiction", 
    getWays: ["VPN via International Digital Libraries", "E-Pub Global Distribution"],
    localStores: ["Independent European Importers"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 15, title: "Persepolis", author: "Marjane Satrapi",
    lat: 35.6892, lng: 51.3890, banLevel: "International",
    originDistrict: "Islamic Republic of Iran",
    banReason: "Banned for critical depictions of the Iranian Revolution, political dissent, and religious police.",
    category: "Graphic Novel / Memoir", 
    getWays: ["Digital Open Archives", "Comixology Global Store"],
    localStores: ["Librairie Gourmande (Paris, France)", "Waterstones (London, UK)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 16, title: "Doctor Zhivago", author: "Boris Pasternak",
    lat: 59.9342, lng: 30.3351, banLevel: "International",
    originDistrict: "Soviet Union (Historical Ban)",
    banReason: "Banned by Soviet censors for implicitly criticizing the Bolshevik Revolution and Marxist dogma.",
    category: "Classic Literature", 
    getWays: ["Project Gutenberg", "Open Library Free Digital Loan"],
    localStores: ["Shakespeare and Company (Paris, France)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 17, title: "Animal Farm", author: "George Orwell",
    lat: 39.9042, lng: 116.4074, banLevel: "International",
    originDistrict: "People's Republic of China",
    banReason: "Online searches, discussions, and distribution heavily censored due to anti-authoritarian metaphors.",
    category: "Allegory / Classic", 
    getWays: ["Tor Network Access", "Gutenberg Australia"],
    localStores: ["Kubrick Books (Hong Kong)", "Eslite Bookstore (Taiwan)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  },
  {
    id: 18, title: "The Catcher in the Rye", author: "J.D. Salinger",
    lat: -33.8688, lng: 151.2093, banLevel: "International",
    originDistrict: "Australia (Historical Import Ban)",
    banReason: "Banned from importation between 1956 and 1968 due to vulgarity and immorality concerns.",
    category: "Classic Literature", 
    getWays: ["Local Public Library System", "Eason Digital Store"],
    localStores: ["Better Read Than Dead (Sydney, Australia)"],
    userShare: "", mediaLink: "", creditedAuthor: "", verified: true, comments: []
  }
];

// Recalculate Leaflet's dimensions when a tab is snapped or resized.
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let frame;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    };
    const observer = new ResizeObserver(refresh);
    observer.observe(container);
    window.addEventListener('resize', refresh);
    refresh();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', refresh);
      cancelAnimationFrame(frame);
    };
  }, [map]);
  return null;
}

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
  title: '', author: '', userShare: '', imageFile: null, imagePreview: '',
  mediaLink: '', banLevel: 'State', district: '', reason: '', store: '', 
  getWay: '', isAnonymous: true, creditName: ''
};

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Bootstrap Mobile-Friendly Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark top-nav">
          <Link className="navbar-brand fw-bold" to="/">Land of Lost Stories</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><Link className="nav-link" to="/">Map</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/about">About Us</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<MapView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/contact" element={<ContactView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// --- YOUR ORIGINAL MAP & FORM COMPONENT ---
function MapView() {
  const [bannedBooks, setBannedBooks] = useState(REAL_BANNED_BOOKS);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [formStep, setFormStep] = useState(1);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: 'All' });
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Fetch Database
  useEffect(() => {
    async function fetchDatabaseBooks() {
      try {
        const response = await fetch('/api/books');
        if (response.ok) {
          const dbBooks = await response.json();
          // Ensure imported DB books have comments array
          const formattedDbBooks = dbBooks.map(b => ({ ...b, comments: b.comments || [] }));
          const verifiedTitles = new Set(REAL_BANNED_BOOKS.map(b => b.title.toLowerCase()));
          const userSubmissions = formattedDbBooks.filter(b => !verifiedTitles.has(b.title.toLowerCase()));
          setBannedBooks([...userSubmissions, ...REAL_BANNED_BOOKS]);
        }
      } catch (err) {
        console.warn("API offline or unreachable; using local records");
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
      .map(book => ({ name: book.creditedAuthor, bookTitle: book.title }));
  }, [bannedBooks]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageFile: file, imagePreview: reader.result }));
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
      verified: false, // Human input, defaults to Pirate Icon
      comments: []
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
        setBannedBooks(prev => [{ id: Date.now(), ...newEntryPayload }, ...prev]);
      }
    } catch (err) {
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

  // Handle Comment Submission with Profanity Filter
  const handleAddComment = (bookId, e) => {
    e.preventDefault();
    const commentText = e.target.elements.commentInput.value;
    if (!commentText.trim()) return;

    const isFlagged = checkProfanity(commentText);
    const newComment = {
      text: isFlagged ? "[Comment hidden pending admin review]" : commentText,
      originalText: commentText, // Save this for you (the dev) to review in the DB
      isFlagged: isFlagged,
      date: new Date().toLocaleDateString()
    };

    if (isFlagged) console.warn("FLAGGED COMMENT:", commentText);

    setBannedBooks(prevBooks => prevBooks.map(book => {
      if (book.id === bookId) {
        return { ...book, comments: [...(book.comments || []), newComment] };
      }
      return book;
    }));

    e.target.reset();
  };

  return (
    <div className="map-view">
      
      {/* Top Credits Button overlaying the map */}
      <button 
        className="credits-nav-btn position-absolute m-3 shadow"
        style={{ zIndex: 1000, top: 0, right: 0 }}
        onClick={() => setShowCreditsModal(true)}
      >
        Community Credits ({creditsList.length})
      </button>

      {/* Map Container */}
      <div className={`map-container h-100 w-100 ${isAddingMode ? 'adding-mode' : ''}`}>
        <MapContainer 
          center={[38.0000, -97.0000]} 
          zoom={4} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer attribution='Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />

          <MapClickHandler isAddingMode={isAddingMode} onMapClick={(latlng) => { setPendingCoords(latlng); setFormStep(1); }} />

          <MapResizeHandler />

          {/* Markers */}
          {filteredBooks.map((book) => (
            <Marker 
              key={book._id || book.id} 
              position={[book.lat, book.lng]}
              icon={book.verified ? NoReadingIcon : PirateIcon}
            >
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
                    <ul>{book.getWays && book.getWays.map((way, idx) => <li key={idx}>{way}</li>)}</ul>
                  </div>

                  <div className="info-section stores">
                    <h4>Supporting Local Bookstores:</h4>
                    <ul>{book.localStores && book.localStores.map((store, idx) => <li key={idx}>{store}</li>)}</ul>
                  </div>

                  {book.creditedAuthor && (
                    <div className="info-section attribution">
                      <p><small>Contributed by: <strong>{book.creditedAuthor}</strong></small></p>
                    </div>
                  )}

                  <hr className="my-3"/>
                  
                  {/* === NEW: COMMENT SECTION === */}
                  <div className="info-section comments-container">
                    <h4 className="fw-bold mb-2">Community Experiences</h4>
                    <div className="comments-list mb-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {book.comments && book.comments.length > 0 ? (
                        book.comments.map((c, i) => (
                          <div key={i} className={`p-2 mb-2 small rounded ${c.isFlagged ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                            {c.text} 
                            <div className="text-muted mt-1" style={{fontSize: '0.7rem'}}>{c.date}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small mb-2">No comments yet. Share your experience!</p>
                      )}
                    </div>
                    
                    <form onSubmit={(e) => handleAddComment(book.id, e)} className="d-flex flex-column gap-2 mt-2">
                      <textarea 
                        name="commentInput"
                        className="form-control form-control-sm" 
                        placeholder="What did this book do for you?"
                        rows="2"
                        required
                      ></textarea>
                      <button type="submit" className="btn btn-sm btn-dark w-100">Post Comment</button>
                    </form>
                  </div>

                </div>
              </Popup>
            </Marker>
          ))}

          {pendingCoords && <Marker position={[pendingCoords.lat, pendingCoords.lng]} icon={PirateIcon} />}
        </MapContainer>
      </div>

      <img src="/logo_banned_books.png" alt="Land of Lost Stories Logo" className="main-logo" />

      {isAddingMode && (
        <div className="click-prompt-banner">
          Target Mode Active: Click anywhere on the map to log a banned book pin
        </div>
      )}

      {/* Floating Bottom Toolbar (Your exact original filters) */}
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
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <button 
          className={`add-pin-btn ${isAddingMode ? 'active' : ''}`}
          onClick={() => { setIsAddingMode(!isAddingMode); setPendingCoords(null); }}
        >
          {isAddingMode ? 'Cancel' : '+ Drop Pin'}
        </button>
      </div>

      {/* User Submission Multi-Step Modal (Your exact original form) */}
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
                  <input type="text" required placeholder="e.g. Beloved" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Author*</label>
                  <input type="text" required placeholder="e.g. Toni Morrison" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>What would you like to share about this book?</label>
                  <textarea rows={3} placeholder="Share a reflection, poem, thoughts, or context..." value={formData.userShare} onChange={(e) => setFormData({...formData, userShare: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Upload a Drawing / Artwork (Optional)</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {formData.imagePreview && <img src={formData.imagePreview} alt="Upload Preview" className="form-image-preview" />}
                </div>
                <div className="form-group">
                  <label>Audio / Video Link (Optional)</label>
                  <input type="url" placeholder="SoundCloud, YouTube, Vimeo, or Spotify link..." value={formData.mediaLink} onChange={(e) => setFormData({...formData, mediaLink: e.target.value})} />
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
                    <select value={formData.banLevel} onChange={(e) => setFormData({...formData, banLevel: e.target.value})}>
                      <option value="Federal">Federal</option>
                      <option value="State">State</option>
                      <option value="County">County</option>
                      <option value="Local School District">Local School District</option>
                      <option value="International">International</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>District / Specific Region</label>
                    <input type="text" placeholder="e.g. Keller ISD, TX" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Stated Reason for Ban (if known)</label>
                  <textarea rows={2} placeholder="e.g. Challenged for mature themes..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Where can people get this book?</label>
                  <input type="text" placeholder="e.g. Libby, Internet Archive, Local Library" value={formData.getWay} onChange={(e) => setFormData({...formData, getWay: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Supporting Local Bookstore</label>
                  <input type="text" placeholder="e.g. The Wild Detectives" value={formData.store} onChange={(e) => setFormData({...formData, store: e.target.value})} />
                </div>
                <div className="attribution-card">
                  <label className="anon-toggle">
                    <input type="checkbox" checked={formData.isAnonymous} onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})} />
                    <div className="toggle-text">
                      <span className="toggle-title">Keep my submission anonymous</span>
                      <span className="toggle-subtitle">Uncheck to add your name to our community credits page</span>
                    </div>
                  </label>
                  {!formData.isAnonymous && (
                    <div className="credit-input-field">
                      <label>Name or Handle to Credit</label>
                      <input type="text" placeholder="Your name or handle" value={formData.creditName} onChange={(e) => setFormData({...formData, creditName: e.target.value})} autoFocus />
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

      {/* Community Credits Modal (Your exact original modal) */}
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
                    <li key={index}><strong>{item.name}</strong> <span>for submission on <em>{item.bookTitle}</em></span></li>
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

// ==========================================
// ILLUSTRATED PAGES — THE CAPTAIN'S JOURNAL
// ==========================================

function CompassRose({ small = false }) {
  return (
    <svg
      className={`compass-rose ${small ? 'compass-rose-small' : ''}`}
      viewBox="0 0 160 160"
      role="img"
      aria-label="Decorative eight-point compass rose"
    >
      <circle cx="80" cy="80" r="67" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="58" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 5" />
      <path d="M80 9 L91 69 L151 80 L91 91 L80 151 L69 91 L9 80 L69 69 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M80 16 L88 75 L80 80 Z M144 80 L85 88 L80 80 Z M80 144 L72 85 L80 80 Z M16 80 L75 72 L80 80 Z" fill="currentColor" />
      <path d="M34 34 L74 72 L80 80 L72 74 Z M126 34 L88 74 L80 80 L86 72 Z M126 126 L86 88 L80 80 L88 86 Z M34 126 L72 86 L80 80 L74 88 Z" fill="currentColor" opacity=".5" />
      <circle cx="80" cy="80" r="7" fill="var(--paper-color, #e8d6ad)" stroke="currentColor" />
      <text x="80" y="7" textAnchor="middle" fontSize="9" fill="currentColor">N</text>
      <text x="80" y="158" textAnchor="middle" fontSize="9" fill="currentColor">S</text>
      <text x="3" y="83" textAnchor="middle" fontSize="9" fill="currentColor">W</text>
      <text x="157" y="83" textAnchor="middle" fontSize="9" fill="currentColor">E</text>
    </svg>
  );
}

function WaveRule() {
  return (
    <div className="wave-rule" aria-hidden="true">
      <span />
      <span className="wave-rule-star">✦</span>
      <span />
    </div>
  );
}

function JournalFrame({ children, narrow = false, className = '' }) {
  return (
    <div className={`sea-scene ${className}`}>
      <div className="sea-stars" aria-hidden="true">✧ &nbsp; · &nbsp; ✦ &nbsp; · &nbsp; ✧</div>
      <div className="journal-wrap">
        <div className={`journal-paper ${narrow ? 'journal-paper-narrow' : ''}`}>
          <span className="corner-etch corner-top-left" aria-hidden="true">✦</span>
          <span className="corner-etch corner-top-right" aria-hidden="true">✦</span>
          <span className="corner-etch corner-bottom-left" aria-hidden="true">✦</span>
          <span className="corner-etch corner-bottom-right" aria-hidden="true">✦</span>
          {children}
        </div>
      </div>
      <div className="sea-bottom-waves" aria-hidden="true" />
    </div>
  );
}

function AboutView() {
  return (
    <JournalFrame className="about-scene">
      <header className="journal-masthead">
        <p className="journal-kicker">AN ATLAS OF THE STORIES THEY TRIED TO HIDE</p>
        <div className="masthead-illustration">
          <span className="masthead-route" aria-hidden="true">· · · · · · · · ·</span>
          <CompassRose />
          <span className="masthead-route" aria-hidden="true">· · · · · · · · ·</span>
        </div>
        <h1>Here Be Stories</h1>
        <p className="masthead-subtitle">A captain’s log of lost and found words</p>
        <WaveRule />
      </header>

      <div className="journal-body">
        <section className="journal-chapter" aria-labelledby="mission-title">
          <div className="chapter-label"><span>LOG ENTRY 001</span><span>THE PURPOSE</span></div>
          <h2 id="mission-title">Not all treasure is buried.</h2>
          <p className="journal-lead">
            Some of it lives between the covers of a book.
          </p>
          <p>
            The Land of Lost Stories is a community-driven map dedicated to
            tracking and bringing awareness to banned books across the world.
            Each pin marks a place where a story has been challenged, restricted,
            or removed, and offers a way to find out more.
          </p>
          <p>
            Follow the map, explore the stories, and add your own reflections.
            The point isn’t to tell you what to read. It’s to make the paths
            to these stories easier to discover.
          </p>
          <div className="handwritten-aside"><span aria-hidden="true">↳</span> Every pin has a story behind it.</div>
        </section>

        <section className="journal-chapter crew-section" aria-labelledby="crew-title">
          <WaveRule />
          <div className="chapter-label"><span>LOG ENTRY 002</span><span>THE CREW</span></div>
          <h2 id="crew-title">The hands at the helm.</h2>
          <div className="crew-ledger">
            <article className="crew-row">
              <span className="crew-ink-number">01</span>
              <div><h3>Pragya Singh &amp; Xtine Burrough</h3><p>Curation &amp; Research</p></div>
              <span className="ledger-mark" aria-hidden="true">✧</span>
            </article>
            <article className="crew-row">
              <span className="crew-ink-number">02</span>
              <div><h3>Pragya Singh</h3><p>Platform Architecture</p></div>
              <span className="ledger-mark" aria-hidden="true">✧</span>
            </article>
          </div>
        </section>

        <section className="journal-chapter credits-section" aria-labelledby="credits-title">
          <WaveRule />
          <div className="chapter-label"><span>LOG ENTRY 003</span><span>THE MAKERS’ MARKS</span></div>
          <h2 id="credits-title">A few names in the margins.</h2>
          <p>Even a good map borrows a symbol or two. Credit where it belongs:</p>
          <ul className="ink-credits">
            <li>Pirate flag icon by Lee Mette from Noun Project (CC BY 3.0)</li>
            <li>No reading icon by Muhammad Riza from Noun Project (CC BY 3.0)</li>
          </ul>
        </section>
      </div>

      <footer className="journal-signoff">
        <span className="signoff-seal" aria-hidden="true">✦</span>
        <p>May no story remain lost.</p>
        <Link to="/" className="ink-link">← Back to the map</Link>
      </footer>
    </JournalFrame>
  );
}

function BottleIllustration() {
  return (
    <svg className="bottle-art" viewBox="0 0 200 250" role="img" aria-label="An illustrated bottle holding a rolled message">
      <path d="M82 18 Q100 10 118 18 L117 43 Q116 58 129 71 Q159 96 160 160 L160 203 Q158 228 135 230 L65 230 Q42 226 40 203 L40 160 Q42 96 71 71 Q84 58 83 43 Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M79 15 Q100 8 121 15 M80 22 L120 22 M84 41 L116 41" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="85" y="8" width="30" height="15" rx="4" fill="var(--paper-color, #e8d6ad)" stroke="currentColor" strokeWidth="2" />
      <path d="M51 154 Q99 140 149 154 L149 205 Q130 216 100 216 Q65 216 51 205 Z" fill="currentColor" opacity=".1" />
      <path d="M69 113 Q91 105 118 113 L129 180 Q101 193 78 183 Z" fill="var(--paper-color, #e8d6ad)" stroke="currentColor" strokeWidth="2.5" transform="rotate(-9 100 150)" />
      <path d="M82 132 L114 127 M81 143 L116 138 M80 154 L110 150" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
      <path d="M66 84 Q55 96 51 115" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".4" />
      <path d="M30 226 Q55 216 80 226 T130 226 T180 226" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M23 63 L31 63 M27 59 L27 67 M168 92 L176 92 M172 88 L172 96" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ContactView() {
  return (
    <JournalFrame narrow className="contact-scene">
      <header className="journal-masthead contact-masthead">
        <p className="journal-kicker">POST OFFICE OF THE OPEN SEAS</p>
        <BottleIllustration />
        <h1>A Message in a Bottle</h1>
        <p className="masthead-subtitle">Words travel farther than ships.</p>
        <WaveRule />
      </header>

      <section className="journal-chapter contact-chapter" aria-labelledby="contact-letter-title">
        <div className="chapter-label"><span>CORRESPONDENCE</span><span>TO THE CREW</span></div>
        <h2 id="contact-letter-title">Have something to tell us?</h2>
        <p>
          Found a story we should know about? Have a question about the project,
          or an idea for the map? We'd love to hear what you've discovered.
        </p>
        <p>Write a note below. The bottle is still being fitted for its voyage.</p>

        <form className="bottle-form" onSubmit={(event) => event.preventDefault()}>
          <div className="letter-field">
            <label htmlFor="contact-name">From the desk of</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Your name" />
          </div>
          <div className="letter-field">
            <label htmlFor="contact-message">Your message</label>
            <textarea id="contact-message" name="message" rows="5" placeholder="Dear crew, ..." />
          </div>
          <button className="bottle-submit" type="button" disabled title="Message delivery has not been connected yet">
            <span aria-hidden="true">✉</span> Bottle service coming soon
          </button>
          <p className="form-footnote">The form isn't connected to a mailbox yet, so messages cannot be sent from this page.</p>
        </form>
      </section>

      <footer className="journal-signoff">
        <span className="signoff-seal" aria-hidden="true">✦</span>
        <p>Until our paths cross again.</p>
        <Link to="/" className="ink-link">← Back to the map</Link>
      </footer>
    </JournalFrame>
  );
}
