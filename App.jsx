import React, { useState, useRef, useEffect } from 'react';

const allowedPrices = [5.00, 7.00, 10.00];

// Define categories and their folder structure
const categories = {
  cars: { name: 'Cars', folder: 'cars' },
  anime: { name: 'Anime', folder: 'anime' },
  coding: { name: 'Coding', folder: 'coding' },
  music: { name: 'Music', folder: 'music' },
  aesthetic: { name: 'Aesthetic', folder: 'aesthetic' },
  movies: { name: 'Movies', folder: 'movies' },
  girl: { name: 'Girl', folder: 'girl' },
  phone: { name: 'Phone', folder: 'phone' },
  sports: { name: 'Sports', folder: 'sports' }
};

// Create stickers array based on folder structure
// Each category will have its own stickers from its respective folder
const stickers = [];

// Add stickers from main stickers folder (for "All Stickers" category)
// These are the existing stickers in the main stickers folder
for (let i = 1; i <= 57; i++) {
  stickers.push({
    id: `main_${i}`,
    name: `Sticker ${i}`,
    price: '7.00',
    img: `/stickers/sticker${i}.png`, // Path to main stickers folder
    category: 'all'
  });
}

// Generate stickers for each category folder
Object.entries(categories).forEach(([categoryKey, categoryData]) => {
  // Assuming each category folder has 8 stickers (sticker1.png to sticker8.png)
  for (let i = 1; i <= 10; i++) {
    stickers.push({
      id: `${categoryKey}_${i}`, // Unique ID for each sticker
      name: `${categoryData.name} Sticker ${i}`,
      price: '7.00',
      img: `/stickers/${categoryData.folder}/sticker${i}.png`, // Path to folder-specific image
      category: categoryKey
    });
  }
});

const API_BASE = 'https://stickitize-backend.onrender.com';

export default function App() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]); // [{id, qty}]
  const [zoomImg, setZoomImg] = useState(null); // holds image url for zoom view
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderPayment, setOrderPayment] = useState('Pay on delivery/pickup');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [pickupType, setPickupType] = useState('SELF-PICKUP');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPw, setAdminPw] = useState('');
  const [adminError, setAdminError] = useState('');
  const [orders, setOrders] = useState([]); // [{name, phone, stickers: [id]}]
  const [contactMessages, setContactMessages] = useState([]); // [{name, email, message}]
  const [messageSent, setMessageSent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // New state for category filtering
  const [navOpen, setNavOpen] = useState(false); // New state for mobile nav
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [adminToken, setAdminToken] = useState(null); // Store admin token after login
  const [loading, setLoading] = useState(false); // Global loading state
  // Carousel state for smooth transition
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [carouselTransition, setCarouselTransition] = useState(true);
  const [isManual, setIsManual] = useState(false);
  const autoScrollTimeout = useRef();
  const carouselRef = useRef();
  const categoryScrollRef = useRef();
  const [catScrollPaused, setCatScrollPaused] = useState(false);
  // Cart Drawer state
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const cartFabRef = useRef();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to close mobile nav after navigation
  const handleNav = (targetPage) => {
    console.log('handleNav called, setting page to:', targetPage);
    setPage(targetPage);
    setNavOpen(false);
  };

  // Helper to toggle nav (for hamburger)
  const handleNavToggle = () => {
    setNavOpen(open => !open);
  };

  // Add to cart logic
  // Animate cart icon when item is added
  useEffect(() => {
    if (cartBounce > 0) {
      setCartBounce(true);
      const timeout = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [cartBounce]);

  // Open cart drawer when cart icon is clicked
  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);

  // Close drawer on outside click or ESC
  useEffect(() => {
    if (!cartDrawerOpen) return;
    function handleKey(e) { if (e.key === 'Escape' && !zoomImg) closeCartDrawer(); }
    function handleClick(e) {
      if (zoomImg) return; // Don't close cart if zoom modal is open
      if (cartFabRef.current && !cartFabRef.current.contains(e.target) && !document.getElementById('cart-drawer').contains(e.target)) {
        closeCartDrawer();
      }
    }
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [cartDrawerOpen, zoomImg]);

  // When item is added to cart, show bounce and badge
  const handleAddToCart = (stickerId) => {
    setCart(prev => {
      const found = prev.find(item => item.id === stickerId);
      if (found) {
        // Remove from cart if already added
        return prev.filter(item => item.id !== stickerId);
      } else {
        setCartBounce(true);
        return [...prev, { id: stickerId, qty: 1 }];
      }
    });
  };

  // Remove from cart logic
  const handleRemoveFromCart = (stickerId) => {
    setCart(prev => prev.filter(item => item.id !== stickerId));
  };

  // Get total items in cart
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Get cart sticker details
  const cartDetails = cart.map(item => {
    const sticker = stickers.find(s => s.id === item.id);
    return { ...sticker, qty: item.qty };
  });
  // Calculate checkout total (including delivery if selected)
  const cartSubtotal = cartDetails.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);
  const deliveryCharge = (pickupType === 'DELIVERY' && cartSubtotal <= 50) ? 10 : 0;
  const checkoutTotal = cartSubtotal + deliveryCharge;

  // Validate phone number format (must be exactly 10 digits)
  const isValidPhone = /^\d{10}$/.test(orderPhone);

  // Place order logic (add to orders)
  const handlePlaceOrder = async () => {
    setLoading(true);
    // Save sticker names and quantities
    const stickerList = cartDetails.map(item => `${item.name} (x${item.qty})`);
    const orderData = {
      name: orderName,
      phone: orderPhone,
      stickers: stickerList,
      orderType: pickupType,
      address: pickupType === 'DELIVERY' ? orderAddress : 'SELF-PICKUP',
      payment: orderPayment
    };
    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCheckout(false);
        console.log('Order placed, setting page to: home');
        setPage('home');
        setCart([]);
        setOrderName('');
        setOrderPhone('');
        setOrderAddress('');
        setOrderPayment('Pay on delivery/pickup');
        setPickupType('SELF-PICKUP');
        setLoading(false);
      }, 3000);
    } catch (err) {
      setLoading(false);
      alert('Failed to place order. Please try again.');
    }
  };

  // Contact form submit handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;
    try {
      await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 2500);
      form.reset();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Failed to send message. Please try again.');
    }
  };

  // Fetch orders and contacts for admin page
  useEffect(() => {
    if (page === 'admin' && adminLoggedIn) {
      fetch(`${API_BASE}/orders`)
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(() => setOrders([]));
      fetch(`${API_BASE}/contacts`)
        .then(res => res.json())
        .then(data => setContactMessages(data))
        .catch(() => setContactMessages([]));
    }
  }, [page, adminLoggedIn]);

  // Clear order by ID
  const handleClearOrder = async (id) => {
    try {
      await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(order => order._id !== id));
    } catch (err) {
      alert('Failed to clear order.');
    }
  };

  // Clear contact by ID
  const handleClearContact = async (id) => {
    try {
      await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
      setContactMessages(prev => prev.filter(msg => msg._id !== id));
    } catch (err) {
      alert('Failed to clear contact message.');
    }
  };

  // Admin login handler
  const handleAdminLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId, password: adminPw })
      });
      const data = await res.json();
      if (data.auth) {
        setAdminLoggedIn(true);
        setAdminToken(data.token);
        setAdminError('');
      } else {
        setAdminError('Try again');
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setAdminError('Server error');
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (page !== 'home') return;
    if (isManual) return; // Pause auto-scroll briefly after manual scroll
    setCarouselTransition(true);
    autoScrollTimeout.current = setTimeout(() => {
      setCarouselTransition(true);
      setFeaturedIndex(idx => (idx + 1) % stickers.length);
    }, 4500);
    return () => clearTimeout(autoScrollTimeout.current);
  }, [page, stickers.length, featuredIndex, isManual]);

  // Resume auto-scroll after manual navigation
  useEffect(() => {
    if (!isManual) return;
    const timeout = setTimeout(() => setIsManual(false), 6000);
    return () => clearTimeout(timeout);
  }, [isManual]);

  // For infinite loop, calculate total width
  const categoryKeys = Object.keys(categories);
  const totalCategories = categoryKeys.length;
  const repeatCount = 4; // Render categories 4 times for a robust loop

  // Auto-scroll effect for category buttons (infinite loop)
  useEffect(() => {
    if (!categoryScrollRef.current) return;
    if (catScrollPaused) return;
    let scrollDiv = categoryScrollRef.current;
    let reqId;
    function autoScroll() {
      const singleSetWidth = scrollDiv.scrollWidth / repeatCount;
      // If scrolled past the first set, reset to the same position in the next set
      if (scrollDiv.scrollLeft >= singleSetWidth * 3) {
        scrollDiv.scrollLeft -= singleSetWidth;
      }
      scrollDiv.scrollLeft += 1;
      reqId = requestAnimationFrame(autoScroll);
    }
    reqId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(reqId);
  }, [catScrollPaused, isMobile]);

  // Pause auto-scroll on user interaction
  function handleCatScrollPause() {
    setCatScrollPaused(true);
    setTimeout(() => setCatScrollPaused(false), 4000);
  }

  // Manual navigation handlers
  const handlePrev = () => {
    setCarouselTransition(true);
    setFeaturedIndex(idx => (idx - 1 + stickers.length) % stickers.length);
    setIsManual(true);
  };
  const handleNext = () => {
    setCarouselTransition(true);
    setFeaturedIndex(idx => (idx + 1) % stickers.length);
    setIsManual(true);
  };

  // Prevent background scroll when cart drawer or zoom modal is open
  useEffect(() => {
    console.log('cartDrawerOpen:', cartDrawerOpen, 'zoomImg:', zoomImg, 'setting overflow:', (cartDrawerOpen || zoomImg) ? 'hidden' : 'auto');
    if (cartDrawerOpen || zoomImg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [cartDrawerOpen, zoomImg]);

  return (
    <div className="container" style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: isMobile ? '12px 0' : '24px 16px',
      boxSizing: 'border-box',
      minHeight: '100vh',
      background: '#101522',
    }}>
      {/* Loading Spinner Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10,20,40,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div className="spinner" style={{
            width: 60,
            height: 60,
            border: '6px solid #6ec1ff',
            borderTop: '6px solid #101828',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {/* Zoomed image modal */}
      {zoomImg && (
        <div
          className="zoom-modal"
          style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,20,40,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000}}
          onClick={() => setZoomImg(null)}
        >
          <button className="zoom-close" onClick={() => setZoomImg(null)} style={{position: 'absolute', top: 32, right: 32, background: 'rgba(30,40,60,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.5em', cursor: 'pointer', zIndex: 1001}}>×</button>
          <img
            src={zoomImg}
            alt="Zoomed Sticker"
            style={{maxWidth: '90vw', maxHeight: '80vh', borderRadius: '18px', boxShadow: '0 0 32px #0008'}}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
      <nav className="navbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 12px' : '0 12px',
        boxSizing: 'border-box',
        minHeight: 70
      }}>
        <div className="navbar-logo" style={{padding: '8px 0'}}>
          <img src="/logo.png" alt="STICKITIZE Logo" style={{borderRadius: '8px', width: '180px', height: '60px', maxWidth: '100%'}} />
        </div>
        {isMobile && (
          <div className="nav-toggle-label" onClick={handleNavToggle} style={{display: 'flex', alignItems: 'center', marginLeft: 12, cursor: 'pointer', padding: '0 4px'}}>
            <span className={`hamburger${navOpen ? ' open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}
        <div className="navbar-links" style={{
          display: isMobile ? (navOpen ? 'flex' : 'none') : 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '18px',
          alignItems: 'center',
          position: isMobile ? 'absolute' : 'static',
          top: isMobile ? 70 : undefined,
          left: isMobile ? 0 : undefined,
          width: isMobile ? '100vw' : undefined,
          background: isMobile ? '#181c2a' : undefined,
          zIndex: isMobile ? 10 : undefined,
          boxShadow: isMobile ? '0 8px 32px #10152299' : undefined,
          borderRadius: isMobile ? '0 0 16px 16px' : undefined,
          padding: isMobile ? '18px 0 12px 0' : undefined,
          transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
          animation: navOpen && isMobile ? 'dropdownFade 0.3s' : undefined
        }}>
          <button className={`nav-btn${page === 'home' ? ' active' : ''}`} onClick={() => handleNav('home')}>HOME</button>
          <button className={`nav-btn${page === 'store' ? ' active' : ''}`} onClick={() => handleNav('store')}>STORE</button>
          <button className={`nav-btn${page === 'contact' ? ' active' : ''}`} onClick={() => handleNav('contact')}>CONTACT</button>
          <button className={`nav-btn${page === 'admin' ? ' active' : ''}`} onClick={() => handleNav('admin')}>ADMIN</button>
        </div>
      </nav>
      {/* Main content wrapper for padding */}
      <div style={{padding: isMobile ? '0 8px' : '0 24px', boxSizing: 'border-box', width: '100%'}}>
        {page === 'home' && (
          <>
            <header className="hero" style={{
              margin: isMobile ? '18px 0 0 0' : '32px 0 0 0',
              padding: isMobile ? '32px 4vw 24px 4vw' : '60px 0 40px 0',
              borderRadius: 16,
              background: 'linear-gradient(90deg, #0a2342 0%, #1e3a8a 100%)',
              textAlign: 'center',
              color: '#f4f8fb',
              boxSizing: 'border-box',
            }}>
              <h1 style={{fontSize: isMobile ? '2.2rem' : '3rem', marginBottom: 12, letterSpacing: 2, color: '#60a5fa'}}>STICKITIZE</h1>
              <p style={{fontSize: isMobile ? '1.1rem' : '1.3rem', marginBottom: 24, color: '#dbeafe'}}>Your one-stop shop for awesome stickers!</p>
              <a href="#shop" className="cta" onClick={() => setPage('store')} style={{display: 'inline-block', padding: '12px 32px', background: '#0a2342', color: '#60a5fa', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', border: '2px solid #60a5fa', fontSize: isMobile ? '1rem' : '1.1rem'}}>Shop Now</a>
            </header>
            <section className="features" style={{margin: isMobile ? '24px 0' : '40px 0', boxSizing: 'border-box'}}>
              <h2 style={{textAlign: 'center', marginBottom: 24, color: '#60a5fa'}}>Why Choose Us?</h2>
              <div className="feature-list" style={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? 'center' : 'space-around', gap: isMobile ? 18 : 24, boxSizing: 'border-box'}}>
                <div className="feature" style={{background: '#1e293b', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flex: 1, textAlign: 'center', color: '#dbeafe', margin: isMobile ? '0 0 12px 0' : 0}}> <h3>Unique Designs</h3> <p>Find stickers you won't see anywhere else.</p> </div>
                <div className="feature" style={{background: '#1e293b', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flex: 1, textAlign: 'center', color: '#dbeafe', margin: isMobile ? '0 0 12px 0' : 0}}> <h3>High Quality</h3> <p>Durable, waterproof, and vibrant prints.</p> </div>
                <div className="feature" style={{background: '#1e293b', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flex: 1, textAlign: 'center', color: '#dbeafe', margin: 0}}> <h3>Fast Shipping</h3> <p>Get your stickers delivered quickly worldwide.</p> </div>
              </div>
            </section>
            <section className="shop" id="shop">
              <h2>Shop by Category</h2>
              <div
                className="featured-categories-scroll"
                ref={categoryScrollRef}
                onMouseEnter={handleCatScrollPause}
                onTouchStart={handleCatScrollPause}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: 'smooth',
                  gap: isMobile ? 12 : 24,
                  padding: isMobile ? '8px 0 8px 2px' : '12px 0 12px 4px',
                  margin: isMobile ? '18px 0' : '28px 0',
                  borderRadius: 12,
                  background: 'rgba(30,40,60,0.7)',
                  boxShadow: '0 2px 12px #10182833',
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE/Edge
                }}
              >
                {/* Render categories 4 times for infinite loop */}
                {Array.from({length: repeatCount}).flatMap((_, r) => categoryKeys.map((key, idx) => (
                  <button
                    key={key + '-' + r + '-' + idx}
                    className="category-feature-btn"
                    onClick={() => { setSelectedCategory(key); setPage('store'); }}
                    style={{
                      background: '#1e293b',
                      color: '#6ec1ff',
                      border: '2px solid #6ec1ff',
                      borderRadius: 12,
                      padding: isMobile ? '14px 18px' : '18px 32px',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '1.05em' : '1.18em',
                      letterSpacing: 1,
                      boxShadow: '0 2px 12px #10182833',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
                      outline: 'none',
                      minWidth: isMobile ? 120 : 160,
                      flex: '0 0 auto',
                    }}
                  >
                    {categories[key].name}
                  </button>
                )))}
              </div>
            </section>
          </>
        )}
        {page === 'store' && (
          <section className="store" id="store" style={{position: 'relative'}}>
            {/* Removed top-right cart icon */}
            <h2>Our Stickers</h2>
            
            {/* Category Filter Buttons */}
            <div className="category-filters" style={{marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center'}}>
              <button 
                className={`category-btn${selectedCategory === 'all' ? ' active' : ''}`}
                onClick={() => setSelectedCategory('all')}
                style={{
                  background: selectedCategory === 'all' ? '#6ec1ff' : 'rgba(30,40,60,0.9)',
                  color: selectedCategory === 'all' ? '#101828' : '#fff',
                  border: '1px solid #6ec1ff',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                All Stickers
              </button>
              {Object.entries(categories).map(([key, category]) => (
                <button 
                  key={key}
                  className={`category-btn${selectedCategory === key ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(key)}
                  style={{
                    background: selectedCategory === key ? '#6ec1ff' : 'rgba(30,40,60,0.9)',
                    color: selectedCategory === key ? '#101828' : '#fff',
                    border: '1px solid #6ec1ff',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Category Title */}
            {selectedCategory !== 'all' && (
              <h3 style={{color: '#6ec1ff', textAlign: 'center', marginBottom: '24px', fontSize: '1.5em', fontWeight: 'bold'}}>
                {categories[selectedCategory].name} Stickers
              </h3>
            )}

            <div className="store-grid">
              {stickers
                .filter(sticker => {
                  if (selectedCategory === 'all') {
                    return sticker.category === 'all'; // Show only main folder stickers
                  } else {
                    return sticker.category === selectedCategory; // Show category-specific stickers
                  }
                })
                .map(sticker => {
                  const inCart = cart.find(item => item.id === sticker.id);
                  return (
                    <div className="store-card" key={sticker.id}>
                      <img src={sticker.img} alt={sticker.name} style={{cursor: 'pointer'}} onClick={() => setZoomImg(sticker.img)} />
                      <div className="store-info">
                        {/* Removed sticker name */}
                        <span className="store-price">₹{sticker.price}</span>
                      </div>
                      <div className="store-actions">
                        {!inCart ? (
                          <button className={`store-btn`} onClick={() => handleAddToCart(sticker.id)}>
                            Add to Cart
                          </button>
                        ) : (
                          <button className={`store-btn remove`} onClick={() => handleRemoveFromCart(sticker.id)} style={{background: '#ff4d4d', color: '#fff'}}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
        {page === 'contact' && (
          <section className="contact-page" id="contact">
            <h2>Contact Us</h2>
            <div className="contact-form-wrapper" style={{maxWidth: '400px', margin: '0 auto', background: 'rgba(30,40,60,0.9)', borderRadius: '16px', padding: '24px', boxShadow: '0 0 24px #0006'}}>
              <form className="contact-form" style={{display: 'flex', flexDirection: 'column', gap: '18px'}} onSubmit={handleContactSubmit}>
                <label style={{color: '#6ec1ff', fontWeight: 'bold'}}>Name
                  <input type="text" name="name" required style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', fontSize: isMobile ? '1.05em' : undefined}} />
                </label>
                <label style={{color: '#6ec1ff', fontWeight: 'bold'}}>Email
                  <input type="email" name="email" required style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', fontSize: isMobile ? '1.05em' : undefined}} />
                </label>
                <label style={{color: '#6ec1ff', fontWeight: 'bold'}}>Message
                  <textarea name="message" rows={4} required style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', fontSize: isMobile ? '1.05em' : undefined}} />
                </label>
                <button type="submit" className="contact-submit-btn" style={{background: '#6ec1ff', color: '#101828', border: 'none', borderRadius: '6px', padding: '10px 0', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer'}}>Send Message</button>
                {messageSent && (
                  <span style={{color: '#2ecc40', fontWeight: 'bold', textAlign: 'center'}}>Message Sent!</span>
                )}
              </form>
              <div className="contact-details" style={{marginTop: '32px', color: '#fff', textAlign: 'center'}}>
                <p>Email: <a href="mailto:info@stickitize.com" style={{color: '#6ec1ff'}}>info@stickitize.com</a></p>
                <p>Phone: <a href="tel:+919999999999" style={{color: '#6ec1ff'}}>+91 99999 99999</a></p>
                <p>Instagram: <a href="https://instagram.com/stickitize" target="_blank" rel="noopener" style={{color: '#6ec1ff'}}>@stickitize</a></p>
              </div>
            </div>
            <div className="join-section" style={{margin: '48px auto 0', maxWidth: '500px', background: 'rgba(30,40,60,0.95)', borderRadius: '16px', padding: '28px', boxShadow: '0 0 24px #0006', textAlign: 'center'}}>
              <h3 style={{color: '#6ec1ff', marginBottom: '18px'}}>JOIN WITH US AND EARN</h3>
              <p style={{color: '#fff', marginBottom: '18px'}}>Explore opportunities to work with STICKITIZE and grow together!</p>
              <div className="join-options" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <button style={{background: '#101828', color: '#6ec1ff', border: '1px solid #6ec1ff', borderRadius: '8px', padding: '12px', fontWeight: 'bold', fontSize: '1em', cursor: 'pointer'}}>Join the Tech Team</button>
                <button style={{background: '#101828', color: '#6ec1ff', border: '1px solid #6ec1ff', borderRadius: '8px', padding: '12px', fontWeight: 'bold', fontSize: '1em', cursor: 'pointer'}}>Become a Sales Partner</button>
              </div>
              <p style={{color: '#b3e0ff', marginTop: '24px', fontSize: '0.95em'}}>For more info, contact us or fill the form above!</p>
            </div>
          </section>
        )}
        {page === 'admin' && (
          <section className="admin-page" id="admin" style={{maxWidth: '600px', margin: '32px auto', background: 'rgba(30,40,60,0.95)', borderRadius: '16px', padding: '32px', boxShadow: '0 0 24px #0006'}}>
            {!adminLoggedIn ? (
              <div className="admin-login" style={{display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center'}}>
                <h2 style={{color: '#6ec1ff'}}>Admin Login</h2>
                <input type="text" placeholder="Admin ID" value={adminId} onChange={e => setAdminId(e.target.value)} style={{padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', width: '220px', fontSize: isMobile ? '1.05em' : undefined}} />
                <input type="password" placeholder="Password" value={adminPw} onChange={e => setAdminPw(e.target.value)} style={{padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', width: '220px', fontSize: isMobile ? '1.05em' : undefined}} />
                <button style={{background: '#6ec1ff', color: '#101828', border: 'none', borderRadius: '8px', padding: '10px 0', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer', width: '220px'}} onClick={handleAdminLogin}>Login</button>
                {adminError && <span style={{color: '#ff4d4d', fontWeight: 'bold'}}>{adminError}</span>}
              </div>
            ) : (
              <div className="admin-orders" style={{marginTop: '18px'}}>
                <h2 style={{color: '#6ec1ff', marginBottom: '18px'}}>Placed Orders</h2>
                {orders.length === 0 ? (
                  <p style={{color: '#fff'}}>No orders placed yet.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '18px'}}>
                    {orders.map((order, idx) => {
                      // Calculate total price for this order
                      let adminOrderSubtotal = 0;
                      order.stickers.forEach(stickerStr => {
                        // Extract quantity from string like "Sticker 1 (x2)"
                        const qtyMatch = stickerStr.match(/\(x(\d+)\)/);
                        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
                        adminOrderSubtotal += 7 * qty; // All stickers are 7.00
                      });
                      // Add delivery charge if applicable
                      const showDelivery = order.orderType === 'DELIVERY';
                      const deliveryCharge = (showDelivery && adminOrderSubtotal <= 50) ? 10 : 0;
                      let total = adminOrderSubtotal;
                      if (showDelivery) total += deliveryCharge;
                      return (
                        <div key={idx} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#101828', borderRadius: '8px', padding: '12px 18px'}}>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                            <span style={{color: '#fff', fontWeight: 'bold', fontSize: '1.1em'}}>{order.name}</span>
                            <span style={{color: '#b3e0ff', fontSize: '1em'}}>{order.phone}</span>
                            <span style={{color: '#6ec1ff', fontSize: '0.98em'}}>{order.stickers.join(', ')}</span>
                            <span style={{color: '#b3e0ff', fontSize: '0.98em'}}>Mode: {order.orderType}</span>
                            <span style={{color: '#b3e0ff', fontSize: '0.98em'}}>Address: {order.address}</span>
                            <span style={{color: '#2ecc40', fontWeight: 'bold', fontSize: '1.05em'}}>Total: ₹{total.toFixed(2)}{showDelivery && deliveryCharge > 0 ? ' (includes ₹10 delivery)' : showDelivery && deliveryCharge === 0 ? ' (Free delivery!)' : ''}</span>
                          </div>
                          <button style={{background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => handleClearOrder(order._id)}>CLEAR</button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Contact Messages section, visible only to admin */}
                {adminLoggedIn && (
                  <div className="admin-messages" style={{marginTop: '32px'}}>
                    <h2 style={{color: '#6ec1ff', marginBottom: '18px'}}>Contact Messages</h2>
                    {contactMessages.length === 0 ? (
                      <p style={{color: '#fff'}}>No contact messages yet.</p>
                    ) : (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '18px'}}>
                        {contactMessages.map((msg, idx) => (
                          <div key={idx} style={{background: '#101828', borderRadius: '8px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                              <span style={{color: '#fff', fontWeight: 'bold'}}>{msg.name}</span>
                              <span style={{color: '#6ec1ff'}}>{msg.email}</span>
                              <span style={{color: '#b3e0ff'}}>{msg.message}</span>
                            </div>
                            <button style={{background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => handleClearContact(msg._id)}>CLEAR</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
      {/* Floating Cart Icon (fixed, visible on all pages) */}
      {/* Floating Up Arrow (store page only) */}
      {page === 'store' && (
        <button
          className="scroll-up-fab"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: 'calc(max(20px, env(safe-area-inset-bottom, 0px)) + 60px + 16px)', // 16px gap above cart button
            right: 'calc(max(20px, env(safe-area-inset-right, 0px)) + 6px)',
            zIndex: 2000,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#fff',
            border: '3px solid #6ec1ff',
            boxShadow: '0 2px 12px #6ec1ff22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
            color: '#6ec1ff',
            outline: 'none',
            fontWeight: 'bold',
          }}
          aria-label="Scroll to Top"
        >
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
           <circle cx="12" cy="12" r="11" stroke="#e0f2fe" strokeWidth="1.5" fill="#e0f2fe" />
           <polyline points="18 15 12 9 6 15" />
         </svg>
        </button>
      )}
      <button
        className={`cart-fab${cartBounce ? ' bounce' : ''}`}
        ref={cartFabRef}
        onClick={openCartDrawer}
        style={{
          position: 'fixed',
          bottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
          right: 'max(20px, env(safe-area-inset-right, 0px))',
          zIndex: 2000,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: '#101828',
          border: '3px solid #6ec1ff',
          boxShadow: '0 4px 24px #0007',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
          animation: cartBounce ? 'cartBounce 0.4s' : undefined,
        }}
        aria-label="View Cart"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6ec1ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1.5" />
          <circle cx="19" cy="21" r="1.5" />
          <path d="M2.5 4H4.5L6.5 17H19.5L21.5 8H7" />
        </svg>
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#2ecc40',
            color: '#fff',
            borderRadius: '50%',
            padding: '2px 7px',
            fontSize: '1em',
            fontWeight: 'bold',
            minWidth: '22px',
            textAlign: 'center',
            boxShadow: '0 0 6px #0008',
            transition: 'all 0.2s',
          }}>{cartCount}</span>
        )}
        <style>{`
          @keyframes cartBounce { 0% { transform: scale(1); } 30% { transform: scale(1.25); } 60% { transform: scale(0.95); } 100% { transform: scale(1); } }
        `}</style>
      </button>
      {/* Cart Drawer/Sidebar */}
      {cartDrawerOpen && (
        <div id="cart-drawer" style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: isMobile ? '100vw' : 400,
          height: '100vh',
          background: '#181c2a',
          boxShadow: '-8px 0 32px #0008',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlideIn 0.35s',
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #233', background: '#101828'}}>
            <span style={{fontWeight: 'bold', fontSize: '1.2em', color: '#6ec1ff'}}>Your Cart</span>
            <button onClick={closeCartDrawer} style={{background: 'none', border: 'none', color: '#fff', fontSize: '2em', cursor: 'pointer', lineHeight: 1}}>&times;</button>
          </div>
          {/* Free Delivery Dynamic Message */}
          {cartDetails.length > 0 && cartSubtotal < 50 && (
            <div style={{
              background: 'linear-gradient(90deg, #6ec1ff 0%, #4ade80 100%)', // softer blue-green
              color: '#101828',
              borderRadius: 10,
              margin: '14px 24px 0 24px',
              padding: '8px 10px',
              fontWeight: 'bold',
              fontSize: '1em',
              textAlign: 'center',
              boxShadow: '0 2px 8px #10182822',
              animation: 'fadeInHighlight 0.7s',
              letterSpacing: 0.1,
              maxWidth: 320,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              Add stickers worth <span style={{color: '#0a2342', fontWeight: 'bold'}}>₹{(50 - cartSubtotal).toFixed(2)}</span> for <span style={{color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8'}}>FREE delivery!</span>
              <style>{`@keyframes fadeInHighlight { from { opacity: 0; background: #fff; } to { opacity: 1; background: linear-gradient(90deg, #6ec1ff 0%, #4ade80 100%); } }`}</style>
            </div>
          )}
          <div style={{flex: 1, overflowY: 'auto', padding: '24px'}}>
            {cartDetails.length === 0 ? (
              <div style={{color: '#fff', textAlign: 'center', marginTop: 40, fontSize: '1.1em'}}>Your cart is empty.</div>
            ) : (
              cartDetails.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  background: 'rgba(30,40,60,0.9)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '18px',
                  position: 'relative',
                  minHeight: 90
                }}>
                  <img src={item.img} alt={item.name} style={{width: 80, height: 80, objectFit: 'cover', borderRadius: '10px', flexShrink: 0, cursor: 'pointer'}} onClick={() => setZoomImg(item.img)} />
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0}}>
                    <span style={{color: '#6ec1ff', fontWeight: 'bold', fontSize: '1.1em'}}>₹{item.price}</span>
                    <span style={{color: '#b3e0ff'}}>Qty: {item.qty}</span>
                    <div style={{display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
                      <button onClick={() => setCart(prev => prev.map(p => p.id === item.id && p.qty > 1 ? { ...p, qty: p.qty - 1 } : p))} style={{background: '#233', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer'}}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => setCart(prev => prev.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p))} style={{background: '#233', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer'}}>+</button>
                      <button onClick={() => setCart(prev => prev.filter(p => p.id !== item.id))} style={{background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 'bold', fontSize: '1.05em', cursor: 'pointer', marginLeft: 12, whiteSpace: 'nowrap'}}>Remove</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{padding: '18px 24px', borderTop: '1px solid #233', background: '#101828'}}>
            <div style={{color: '#6ec1ff', fontWeight: 'bold', fontSize: '1.15em', marginBottom: 8}}>Total: ₹{cartDetails.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0).toFixed(2)}</div>
            <button
              style={{
                background: cartDetails.length === 0 ? '#233' : '#6ec1ff',
                color: '#101828',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 0',
                fontWeight: 'bold',
                fontSize: '1.1em',
                cursor: cartDetails.length === 0 ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
              disabled={cartDetails.length === 0}
              onClick={() => { if (cartDetails.length > 0) { setShowCheckout(true); closeCartDrawer(); } }}
            >
              Checkout
            </button>
          </div>
          <style>{`
            @keyframes drawerSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          `}</style>
        </div>
      )}
      {/* Checkout modal rendered globally so it always appears when showCheckout is true */}
      {showCheckout && (
        <div className="checkout-modal" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,20,40,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div className="checkout-form-wrapper" style={{
            background: 'rgba(30,40,60,1)',
            borderRadius: '18px',
            padding: isMobile ? '18px 5vw' : '32px',
            maxWidth: isMobile ? '95vw' : '420px',
            width: isMobile ? '95vw' : '100%',
            margin: '0 auto',
            boxShadow: '0 0 32px #000a',
            position: 'relative',
            overflowX: 'hidden',
            wordBreak: 'break-word',
            boxSizing: 'border-box',
          }}>
            <button onClick={() => setShowCheckout(false)} style={{position: 'absolute', top: 18, right: 18, background: 'rgba(30,40,60,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: '1.3em', cursor: 'pointer'}}>×</button>
            <h3 style={{color: '#6ec1ff', marginBottom: '18px'}}>Checkout</h3>
            <form style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <input type="text" placeholder="Name" value={orderName} onChange={e => setOrderName(e.target.value)} required style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', fontSize: isMobile ? '1.05em' : undefined}} />
              <input type="tel" placeholder="Phone Number" value={orderPhone} onChange={e => setOrderPhone(e.target.value)} required style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', fontSize: isMobile ? '1.05em' : undefined}} />
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{color: '#6ec1ff', fontWeight: 'bold'}}>Order Type
                  <div style={{display: 'flex', gap: '12px'}}>
                    <label style={{color: '#fff', fontWeight: 'bold'}}>
                      <input type="radio" name="pickupType" value="SELF-PICKUP" checked={pickupType === 'SELF-PICKUP'} onChange={e => { setPickupType(e.target.value); setOrderAddress('SELF-PICKUP'); }} /> Self-pickup
                    </label>
                    <label style={{color: '#fff', fontWeight: 'bold'}}>
                      <input type="radio" name="pickupType" value="DELIVERY" checked={pickupType === 'DELIVERY'} onChange={e => { setPickupType(e.target.value); setOrderAddress(''); }} /> Delivery (₹10 delivery charge)
                    </label>
                  </div>
                </label>
              </div>
              {pickupType === 'SELF-PICKUP' && (
                <div style={{color: '#6ec1ff', background: '#101828', borderRadius: '8px', padding: '10px', textAlign: 'center', fontWeight: 'bold'}}>You'll receive a call for when you pickup your order.</div>
              )}
              {pickupType === 'DELIVERY' && (
                <select value={orderAddress} onChange={e => setOrderAddress(e.target.value)} required style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #233', background: '#101828', color: '#fff', fontSize: isMobile ? '1.05em' : undefined}}>
                  <option value="">Select Delivery Address</option>
                  <option value="GH2">GH2</option>
                  <option value="GH5">GH5</option>
                  <option value="GH7">GH7</option>
                  <option value="Unimall">Unimall</option>
                  <option value="CC">CC</option>
                  <option value="Buzz">Buzz</option>
                  <option value="BH1">BH1</option>
                  <option value="BH2">BH2</option>
                  <option value="BH3">BH3</option>
                  <option value="BH4">BH4</option>
                  <option value="BH5">BH5</option>
                  <option value="BH6">BH6</option>
                  <option value="BH7">BH7</option>
                </select>
              )}
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{color: '#6ec1ff', fontWeight: 'bold'}}>Payment Mode
                  <div style={{display: 'flex', gap: '12px'}}>
                    <label style={{color: '#fff', fontWeight: 'bold'}}>
                      <input type="radio" name="payment" value="Pay on delivery/pickup" checked={orderPayment === 'Pay on delivery/pickup'} onChange={e => setOrderPayment(e.target.value)} /> Pay on delivery/pickup
                    </label>
                    <label style={{color: '#888', fontWeight: 'bold', opacity: 0.5, cursor: 'not-allowed'}}>
                      <input type="radio" name="payment" value="Pay Online" disabled /> Pay Online (Available Soon)
                    </label>
                  </div>
                </label>
              </div>
              {/* Place Order button, hide after orderPlaced */}
              {!orderPlaced && (
                <>
                  <div style={{
                    color: '#60a5fa',
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    textAlign: 'center',
                    marginBottom: 10
                  }}>
                    Total: ₹{checkoutTotal.toFixed(2)}{pickupType === 'DELIVERY' && deliveryCharge > 0 ? ' (includes ₹10 delivery)' : pickupType === 'DELIVERY' && deliveryCharge === 0 ? ' (Free delivery!)' : ''}
                  </div>
                  <button type="button" disabled={!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment} onClick={handlePlaceOrder} style={{background: (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment) ? '#233' : '#6ec1ff', color: '#101828', border: 'none', borderRadius: '8px', padding: '12px 0', fontWeight: 'bold', fontSize: '1.1em', cursor: (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment) ? 'not-allowed' : 'pointer', marginTop: '12px', width: '100%'}}>Place Order</button>
                </>
              )}
              {orderPlaced && (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '18px'}}>
                  <span style={{fontSize: '2.5em', color: '#2ecc40'}}>✔️</span>
                  <span style={{color: '#2ecc40', fontWeight: 'bold', marginTop: '8px'}}>Order Placed!</span>
                  <span style={{color: '#6ec1ff', marginTop: '10px', fontWeight: 'bold', fontSize: '1.1em'}}>You'll receive your stickers within 2-3 days.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      <footer>
        <p>&copy; 2025 STICKITIZE. All rights reserved.</p>
      </footer>
      <style>{`
        .featured-categories-scroll::-webkit-scrollbar { display: none; height: 0; }
        .featured-categories-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}