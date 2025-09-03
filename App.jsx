import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Define categories and their folder structure
const categories = {
  posters: { name: 'Posters', folder: 'posters', price: '120.00' },
  cars: { name: 'Cars', folder: 'cars' },
  anime: { name: 'Anime', folder: 'anime' },
  coding: { name: 'Coding', folder: 'coding' },
  music: { name: 'Music', folder: 'music' },
  aesthetic: { name: 'Aesthetic', folder: 'aesthetic' },
  movies: { name: 'Movies', folder: 'movies' },
  girl: { name: 'Girl', folder: 'girl' },
  phone: { name: 'Phone', folder: 'phone' },
  sports: { name: 'Sports', folder: 'sports' },
  fun: {name: 'Fun', folder: 'fun'}
};

// Dynamically import all sticker images from public/stickers/[category] using Vite's import.meta.glob
// This will only work for images in /src or /public, and at build time

function getStickerImages(categoryKey, categoryData) {
  // Vite's import.meta.glob only works for /src, so we use public URLs
  // We'll use a trick: fetch all files in public/stickers/[category] at build time
  // We'll use a static require.context-like approach for Vite
  // But since we can't read public/ at runtime, we can use a convention: list all files in the folder
  // We'll use a helper to try all numbers from 1 to 100, and only include those that exist (using an <img> onError fallback)
  // But the best way is to use import.meta.globEager if stickers are in /src/assets
  // For now, let's use a static approach for public/ (since Vite can't glob public/ at runtime)
  // We'll try up to 100, but filter out missing images at render time (already handled by hiddenStickers)
  const stickers = [];
  for (let i = 1; i <= 100; i++) {
    stickers.push({
      id: `${categoryKey}_${i}`,
      name: `${categoryData.name} Sticker ${i}`,
      price: categoryKey === 'stickerpack' ? '100.00' : categoryKey === 'posters' ? '120.00' : '7.00',
      img: `/stickers/${categoryData.folder}/sticker${i}.png`,
      category: categoryKey
    });
  }
  return stickers;
}

// Build stickers array for all categories (excluding 'all')
const stickers = Object.entries(categories).flatMap(([categoryKey, categoryData]) => getStickerImages(categoryKey, categoryData));

// Build per-category sticker arrays (excluding 'stickerpack' and 'posters' for 'all')
const categoryStickerArrays = Object.entries(categories)
  .filter(([key]) => key !== 'posters') // Only exclude 'posters' now
  .map(([categoryKey, categoryData]) => getStickerImages(categoryKey, categoryData));

// Interleave stickers from all subcategories for 'all' (round-robin)
const interleavedAllStickers = [];
let maxLen = Math.max(...categoryStickerArrays.map(arr => arr.length));
for (let i = 0; i < maxLen; i++) {
  for (let arr of categoryStickerArrays) {
    if (arr[i]) interleavedAllStickers.push(arr[i]);
  }
}

// Fix API_BASE to support both localhost and production
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : 'https://stickitize-backend.onrender.com';

// Add this above the App component to define top picks stickers from the 'home' folder
const topPicks = [];
for (let i = 1; i <= 8; i++) {
  topPicks.push({
    id: `home_${i}`,
    name: `Top Pick Sticker ${i}`,
    price: '7.00',
    img: `/stickers/home/sticker${i}.png`,
    category: 'home'
  });
}

//

export default function App() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]); // [{id, qty}]
  const [zoomImg, setZoomImg] = useState(null); // holds image url for zoom view
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderName, setOrderName] = useState('');
  // Remove OTP/Phone states
  const [phone, setPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderPayment, setOrderPayment] = useState('Pay Online');
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
  //
  const [showCustom, setShowCustom] = useState(false);
  const categoryScrollRef = useRef();
  const [catScrollPaused, setCatScrollPaused] = useState(false);
  // Cart Drawer state
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const cartFabRef = useRef();
  const [hiddenStickers, setHiddenStickers] = useState([]); // Track stickers whose images failed to load
  const [paymentLoading, setPaymentLoading] = useState(false); // New state for payment loading
  const [paymentError, setPaymentError] = useState(''); // New state for payment error

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add useEffect to sync page state with URL hash
  useEffect(() => {
    function syncPageWithHash() {
      if (window.location.hash === '#shop') {
        setPage('store');
      } else if (window.location.hash === '#contact') {
        setPage('contact');
      } else if (window.location.hash === '#admin') {
        setPage('admin');
      } else if (window.location.hash === '#privacy') {
        setPage('privacy');
      } else if (window.location.hash === '#terms') {
        setPage('terms');
      } else if (window.location.hash === '#refund') {
        setPage('refund');
      } else if (window.location.hash === '#shipping') {
        setPage('shipping');
      } else {
        setPage('home');
      }
    }
    window.addEventListener('hashchange', syncPageWithHash);
    syncPageWithHash(); // Initial sync
    return () => window.removeEventListener('hashchange', syncPageWithHash);
  }, []);

  // Helper to close mobile nav after navigation
  const handleNav = (targetPage) => {
    if (targetPage === 'store') {
      window.location.hash = '#shop';
      window.scrollTo({ top: 0, behavior: 'auto' }); // instant scroll
    } else if (targetPage === 'contact') {
      window.location.hash = '#contact';
    } else if (targetPage === 'admin') {
      window.location.hash = '#admin';
    } else if (targetPage === 'privacy') {
      window.location.hash = '#privacy';
    } else if (targetPage === 'terms' ) {
      window.location.hash = '#terms';
    } else if (targetPage === 'refund' ) {
      window.location.hash = '#refund';
    } else if (targetPage === 'shipping' ) {
      window.location.hash = '#shipping';
    } else {
      window.location.hash = '';
    }
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

  // Get cart product details (stickers, posters, packs)
  const getProductById = (id) => {
    return stickers.find(s => s.id === id) || topPicks.find(s => s.id === id);
  };

  const cartDetails = cart.map(item => {
    const product = getProductById(item.id);
    return { ...product, qty: item.qty };
  });
  // Detect if any poster is in the cart
  const hasPosterInCart = cartDetails.some(item => item.category === 'posters');
  // Force online payment if posters are present
  useEffect(() => {
    if (hasPosterInCart && orderPayment !== 'Pay Online') {
      setOrderPayment('Pay Online');
    }
  }, [hasPosterInCart]);
  // Calculate checkout total (including delivery if selected)
  const cartSubtotal = cartDetails.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0);
  // Free delivery if subtotal >= 49 or address is BH3
  const deliveryCharge = (pickupType === 'DELIVERY' && cartSubtotal < 49 && orderAddress !== 'BH3') ? 10 : 0;
  const checkoutTotal = cartSubtotal + deliveryCharge;

  // Validate phone number format (must be exactly 10 digits)
  const isValidPhone = /^\d{10}$/.test(phone);

  // Place order logic (add to orders)
  const handlePlaceOrder = async () => {
    setLoading(true);
    const stickerList = cartDetails.map(item => `${item.name} (x${item.qty})`);
    const orderData = {
      name: orderName,
      phone: phone,
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
      setShowCheckout(false);
      setCart([]);
      setOrderName('');
      setPhone('');
      setOrderAddress('');
      setOrderPayment('Pay on delivery/pickup');
      setPickupType('SELF-PICKUP');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert('Failed to place order. Please try again.');
    }
  };

  // Payment functions for Cashfree
  const handleOnlinePayment = async () => {
    if (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress)) {
      alert('Please fill in all required fields before proceeding with payment.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      // Generate unique order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create payment order with Cashfree
      const paymentData = {
        orderId: orderId,
        orderAmount: checkoutTotal.toFixed(2),
        customerId: `CUST_${phone}`,
        customerName: orderName,
        customerEmail: `${phone}@stickitize.com`, // Using phone as email since email is not collected
        customerPhone: phone
      };

      const response = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const paymentOrder = await response.json();
      const { checkoutUrl, paymentSessionId } = paymentOrder || {};
      
      // Store order details for after payment
      const orderData = {
        name: orderName,
        phone: phone,
        stickers: cartDetails.map(item => `${item.name} (x${item.qty})`),
        orderType: pickupType,
        address: pickupType === 'DELIVERY' ? orderAddress : 'SELF-PICKUP',
        payment: 'Paid Online',
        status: 'PAID',
        orderId: orderId,
        paymentOrderId: paymentOrder.orderId
      };

      localStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Use Cashfree Checkout SDK (production)
      if (paymentSessionId) {
        try {
          const { load } = await import('@cashfreepayments/cashfree-js');
          const cf = await load({ mode: 'production' });
          await cf.checkout({ paymentSessionId, redirectTarget: '_self' });
          return;
        } catch (e) {
          console.warn('Checkout SDK failed, falling back to hosted URL:', e);
        }
      }

      // Fallback to hosted checkout URL
      if (!checkoutUrl) throw new Error('Payment initiation failed: no checkout URL');
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Failed to initiate payment. Please try again.');
      setPaymentLoading(false);
    }
  };

  // Handle payment success callback
  const handlePaymentSuccess = async () => {
    try {
      const pendingOrder = localStorage.getItem('pendingOrder');
      if (!pendingOrder) {
        console.error('No pending order found');
        return;
      }

      const orderData = JSON.parse(pendingOrder);

      // Verify with backend/Cashfree before saving
      const verifyRes = await fetch(`${API_BASE}/api/payments/verify?order_id=${encodeURIComponent(orderData.orderId)}`);
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || (verifyJson.order_status && verifyJson.order_status !== 'PAID' && verifyJson.order_status !== 'SUCCESS')) {
        console.error('Payment verify failed or not paid:', verifyJson);
        setPaymentError('Payment not confirmed yet. If amount was debited, contact support.');
        return;
      }

      // Save order to backend
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      // Clear pending order
      localStorage.removeItem('pendingOrder');

      // Show success message
      setOrderPlaced(true);
      setShowCheckout(false);
      setCart([]);
      setOrderName('');
      setPhone('');
      setOrderAddress('');
      setOrderPayment('Pay on delivery/pickup');
      setPickupType('SELF-PICKUP');

    } catch (error) {
      console.error('Error saving order after payment:', error);
      alert('Payment successful but order could not be saved. Please contact support.');
    }
  };

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const orderStatus = urlParams.get('order_status');

    // If we have order_id, attempt verification regardless of order_status
    if (orderId) {
      handlePaymentSuccess();
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 3500);
    } else if (orderStatus === 'FAILED') {
      // Handle payment failure
      setPaymentError('Payment was cancelled or failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  //

  // Contact form submit
  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      setMessageSent(true);
      form.reset();
      // Refresh messages if admin is viewing
      if (adminLoggedIn) await fetchContacts();
    } catch (err) {
      console.error('Contact submit failed:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessageSent(false), 2500);
    }
  };

  // Admin login and data actions
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch orders failed:', err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE}/contacts`);
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContactMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch contacts failed:', err);
    }
  };

  const handleAdminLogin = async () => {
    try {
      setLoading(true);
      setAdminError('');
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adminId, password: adminPw })
      });
      const data = await res.json();
      if (data && data.auth) {
        setAdminLoggedIn(true);
        setAdminToken(data.token || null);
        await Promise.all([fetchOrders(), fetchContacts()]);
      } else {
        setAdminError('Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login failed:', err);
      setAdminError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearOrder = async (orderId) => {
    if (!orderId) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE}/orders/${orderId}`, { method: 'DELETE' });
      await fetchOrders();
    } catch (err) {
      console.error('Clear order failed:', err);
      alert('Failed to clear order.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearContact = async (contactId) => {
    if (!contactId) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE}/contacts/${contactId}`, { method: 'DELETE' });
      await fetchContacts();
    } catch (err) {
      console.error('Clear contact failed:', err);
      alert('Failed to clear message.');
    } finally {
      setLoading(false);
    }
  };

  // Load admin data after login
  useEffect(() => {
    if (adminLoggedIn) {
      fetchOrders();
      fetchContacts();
    }
  }, [adminLoggedIn]);

  // For infinite loop, calculate total width
  const totalCategories = Object.keys(categories).length;
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

  //

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

  // Calculate balanced rows for categories
  const numRows = 2;
  const perRow = Math.ceil(totalCategories / numRows);
  const categoryRows = [
    Object.keys(categories).slice(0, perRow),
    Object.keys(categories).slice(perRow)
  ];

  // Helper to handle image load error
  const handleImageError = (id) => {
    setHiddenStickers(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  return (
    <div className="container fade-page" style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: isMobile ? '12px 0' : '24px 16px',
      boxSizing: 'border-box',
      minHeight: '100vh',
      background: '#101522',
      transition: 'background 0.5s cubic-bezier(.4,0,.2,1), color 0.5s cubic-bezier(.4,0,.2,1), box-shadow 0.5s cubic-bezier(.4,0,.2,1)',
    }}>
      {/* Loading Spinner Overlay */}
      {loading && page !== 'admin' && page !== 'store' && page !== 'contact' && (
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
          style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,20,40,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}
          onClick={() => setZoomImg(null)}
        >
          <button className="zoom-close" onClick={() => setZoomImg(null)} style={{position: 'absolute', top: 32, right: 32, background: 'rgba(30,40,60,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.5em', cursor: 'pointer', zIndex: 1001}}>×</button>
          <img
            src={zoomImg}
            alt="Zoomed Sticker"
            style={{maxWidth: '90vw', maxHeight: '80vh', borderRadius: '18px', boxShadow: '0 0 32px #0008'}}
            onClick={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
            onTouchStart={e => e.preventDefault()}
            onDragStart={e => e.preventDefault()}
            draggable={false}
          />
        </div>
      )}
      {/* Payment Processing Modal */}
      {paymentLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10,20,40,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #101828 0%, #2563eb 100%)',
            color: '#e0f2fe',
            borderRadius: '1.3em',
            boxShadow: '0 6px 32px #000b',
            padding: '32px 24px 24px 24px',
            minWidth: 280,
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            border: '2px solid #233',
          }}>
            <div style={{fontSize: '1.35em', fontWeight: 700, marginBottom: 12, color: '#6ec1ff', letterSpacing: 1}}>Processing Payment...</div>
            <div style={{fontSize: '1.08em', marginBottom: 18, color: '#e0f2fe'}}>Please wait while we redirect you to the secure payment gateway.</div>
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
        </div>
      )}
      {/* Order Placed Popup */}
      {orderPlaced && (
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
          zIndex: 9999
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #101828 0%, #2563eb 100%)',
            color: '#e0f2fe',
            borderRadius: '1.3em',
            boxShadow: '0 6px 32px #000b',
            padding: '32px 24px 24px 24px',
            minWidth: 280,
            maxWidth: '90vw',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
            border: '2px solid #233',
          }}>
            <div style={{fontSize: '1.35em', fontWeight: 700, marginBottom: 12, color: '#6ec1ff', letterSpacing: 1}}>Order Placed!</div>
            <div style={{fontSize: '1.08em', marginBottom: 18, color: '#e0f2fe'}}>
              {orderPayment === 'Paid Online' ? 
                'Thank you for your order and payment! You will receive a call soon for confirmation and pickup/delivery details.' :
                'Thank you for your order. You will receive a call soon for confirmation and pickup/delivery details.'
              }
            </div>
            <button onClick={() => { setOrderPlaced(false); setPage('home'); }} style={{
              background: 'linear-gradient(90deg, #6ec1ff 0%, #2563eb 100%)',
              color: '#101828',
              border: 'none',
              borderRadius: '0.8em',
              padding: '12px 38px',
              fontWeight: 700,
              fontSize: '1.13em',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #10182822',
              transition: 'background 0.2s',
              marginTop: 8,
              letterSpacing: 1
            }}>OK</button>
          </div>
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
          <img src="/logo.png" alt="STICKITIZE Logo" style={{borderRadius: '8px', width: '180px', height: '60px', maxWidth: '100%'}} onContextMenu={e => e.preventDefault()} onTouchStart={e => e.preventDefault()} onDragStart={e => e.preventDefault()} draggable={false} />
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
        </div>
      </nav>
      {/* Main content wrapper for padding */}
      <div style={{padding: isMobile ? '0 8px' : '0 24px', boxSizing: 'border-box', width: '100%'}} key={page} className="page-content-fade">
        {page === 'home' && (
          <>
            <header className="hero" style={{
              margin: isMobile ? '18px 0 0 0' : '32px 0 0 0',
              padding: isMobile ? '18px 4vw 12px 4vw' : '32px 0 20px 0',
              borderRadius: 16,
              background: 'linear-gradient(90deg, #0a2342 0%, #1e3a8a 100%)',
              textAlign: 'center',
              color: '#f4f8fb',
              boxSizing: 'border-box',
            }}>
              <h1 style={{fontSize: isMobile ? '2.2rem' : '2.9rem', marginBottom: 8, marginTop: isMobile ? '2px' : '6px', letterSpacing: 2, color: '#60a5fa'}}>STICKITIZE</h1>
              <p style={{fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: 16, color: '#dbeafe'}}>Your one-stop shop for awesome stickers!</p>
              <p style={{fontSize: isMobile ? '1.13rem' : '1.18rem', color: '#b3e0ff', marginTop: -10, marginBottom: 16, fontWeight: 600}}>Buy stickers at just ₹7</p>
              <a href="#shop" className="cta" onClick={e => { e.preventDefault(); window.location.hash = '#shop'; setPage('store'); window.scrollTo({ top: 0, behavior: 'auto' }); }} style={{display: 'inline-block', padding: '12px 32px', background: '#0a2342', color: '#60a5fa', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', border: '2px solid #60a5fa', fontSize: isMobile ? '1rem' : '1.1rem'}}>Shop Now</a>
            </header>
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
                {Array.from({length: repeatCount}).flatMap((_, r) => Object.entries(categories).map(([key, categoryData], idx) => (
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
                    {categoryData.name}
                  </button>
                )))}
              </div>
            </section>
            {/* Top Picks Section */}
            <section className="top-picks" style={{margin: isMobile ? '18px 0 0 0' : '32px 0 0 0'}}>
              <h2 style={{textAlign: 'center', color: '#60a5fa', marginBottom: isMobile ? 16 : 24}}>Top Picks</h2>
              <div className="top-picks-grid" style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: isMobile ? 12 : 24,
                justifyItems: 'center',
                alignItems: 'stretch',
                maxWidth: 1000,
                margin: '0 auto',
                padding: isMobile ? '0 2px' : '0 8px',
              }}>
                {/* 8 Top Picks from home folder */}
                {topPicks.filter(item => !hiddenStickers.includes(item.id)).map((item, idx) => {
                  const inCart = cart.find(cartItem => cartItem.id === item.id);
                  return (
                    <div className="store-card" key={item.id} style={{
                      background: '#1e293b',
                      borderRadius: 16,
                      boxShadow: '0 2px 12px rgba(16,21,34,0.10)',
                      padding: '18px 16px 16px 16px',
                      width: '100%',
                      maxWidth: 220,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'transform 0.2s, box-shadow 0.3s',
                      boxSizing: 'border-box',
                      position: 'relative',
                    }}>
                      {/* NEW tag for first and sixth sticker */}
                      {(idx === 0 || idx === 5) && (
                        <span style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: 'linear-gradient(90deg, #6ec1ff 0%, #2563eb 100%)',
                          color: '#101828',
                          fontWeight: 700,
                          fontSize: '0.92em',
                          borderRadius: 7,
                          padding: '3px 12px',
                          boxShadow: '0 2px 8px #10182822',
                          letterSpacing: 1,
                          zIndex: 2,
                        }}>NEW</span>
                      )}
                      <div style={{
                        width: '100%',
                        maxWidth: '100%',
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <img
                          src={item.img}
                          alt="Product"
                          style={{
                            cursor: 'pointer',
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: 12,
                            marginBottom: 12,
                            border: '2px solid #60a5fa',
                            background: '#101522',
                            display: 'block',
                            boxSizing: 'border-box',
                          }}
                          onClick={() => setZoomImg(item.img)}
                          onError={() => handleImageError(item.id)}
                          onContextMenu={e => e.preventDefault()}
                          onTouchStart={e => e.preventDefault()}
                          onDragStart={e => e.preventDefault()}
                          draggable={false}
                        />
                      </div>
                      <div className="store-info">
                        <span className="store-price">₹{item.price}</span>
                      </div>
                      <div className="store-actions">
                        {!inCart ? (
                          <button className={`store-btn`} onClick={() => handleAddToCart(item.id)}>
                            Add to Cart
                          </button>
                        ) : (
                          <button className={`store-btn remove`} onClick={() => handleRemoveFromCart(item.id)} style={{background: '#ff4d4d', color: '#fff'}}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 12 : 20 }}>
                <button
                  onClick={() => { setPage('store'); window.location.hash = '#shop'; window.scrollTo({ top: 0, behavior: 'auto' }); }}
                  style={{
                    background: '#6ec1ff',
                    color: '#101828',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 38px',
                    fontWeight: 700,
                    fontSize: isMobile ? '1.05em' : '1.13em',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #10182822',
                    transition: 'background 0.2s',
                    letterSpacing: 1
                  }}
                >
                  View More
                </button>
              </div>
            </section>
            <section className="features" style={{margin: isMobile ? '24px 0' : '40px 0', boxSizing: 'border-box'}}>
              <h2 style={{textAlign: 'center', marginBottom: 24, color: '#60a5fa'}}>Why Choose Us?</h2>
              <div className="feature-list" style={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? 'center' : 'space-around', gap: isMobile ? 18 : 24, boxSizing: 'border-box'}}>
                <div className="feature" style={{background: '#1e293b', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flex: 1, textAlign: 'center', color: '#dbeafe', margin: isMobile ? '0 0 12px 0' : 0}}> <h3>Unique Designs</h3> <p>Find stickers you won't see anywhere else.</p> </div>
                <div className="feature" style={{background: '#1e293b', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flex: 1, textAlign: 'center', color: '#dbeafe', margin: isMobile ? '0 0 12px 0' : 0}}> <h3>High Quality</h3> <p>Durable, waterproof, and vibrant prints.</p> </div>
                <div className="feature" style={{background: '#1e293b', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', flex: 1, textAlign: 'center', color: '#dbeafe', margin: 0}}> <h3>Fast Shipping</h3> <p>Get your stickers delivered quickly worldwide.</p> </div>
              </div>
            </section>
          </>
        )}
        {page === 'store' && (
          <section className="store" id="store" style={{position: 'relative'}}>
            <h2>Our Stickers & Posters</h2>
            {/* Category filters and sticker grid as before */}
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
              {Object.entries(categories).filter(([key]) => key !== 'stickerpack').map(([key, category]) => (
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
            {/* Custom Sticker CTA */}
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: 24}}>
              <button
                onClick={() => setShowCustom(v => !v)}
                style={{
                  background: 'rgba(30,40,60,0.9)',
                  color: '#fff',
                  border: '1px solid #6ec1ff',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '1em' : '1.05em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                + Customized Stickers
              </button>
            </div>
            {showCustom && (
              <div style={{
                background: 'rgba(30,40,60,0.9)',
                border: '1px solid #233',
                borderRadius: 12,
                padding: 16,
                margin: '0 auto 24px',
                width: 'min(720px, 92vw)',
                color: '#fff',
                boxShadow: '0 2px 12px rgba(16,21,34,0.25)'
              }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#101828',
                      border: '1px solid #6ec1ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6ec1ff',
                      fontWeight: 900,
                      fontSize: 22
                    }}>+</div>
                    <div>
                      <div style={{fontWeight: 700, color: '#b3e0ff'}}>Upload your image</div>
                      <div style={{fontSize: '0.95em', color: '#dbeafe'}}>Send us the photo you want as a sticker (10rs/sticker).</div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: 10}}>
                    <a
                      href="mailto:8stickbuy@gmail.com?subject=Custom%20Sticker%20Request&body=Please%20attach%20the%20image%2Fartwork%20and%20mention%20size%20and%20quantity."
                      style={{
                        background: '#6ec1ff',
                        color: '#101828',
                        textDecoration: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontWeight: 800
                      }}
                    >
                      Email Image
                    </a>
                    <a
                      href="https://wa.me/919138442368"
                      target="_blank"
                      rel="noopener"
                      style={{
                        background: '#25D366',
                        color: '#101828',
                        textDecoration: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontWeight: 800
                      }}
                    >
                      WhatsApp Image
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div className="store-grid">
              {(() => {
                let products = [];
                if (selectedCategory === 'all') {
                  products = interleavedAllStickers;
                } else {
                  products = stickers.filter(sticker => {
                    return sticker.category === selectedCategory;
                  });
                }
                // Filter out hidden stickers
                products = products.filter(item => !hiddenStickers.includes(item.id));
                if (!products || products.length === 0) {
                  return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>No products found.</div>;
                }
                return products.map(item => {
                  const inCart = cart.find(cartItem => cartItem.id === item.id);
                  return (
                    <div className="store-card" key={item.id} style={{
                      background: '#1e293b',
                      borderRadius: 16,
                      boxShadow: '0 2px 12px rgba(16,21,34,0.10)',
                      padding: (item.category === 'stickerpack' || item.category === 'posters') ? '8px 4px 12px 4px' : '18px 16px 16px 16px',
                      width: '100%',
                      maxWidth: 220,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'transform 0.2s, box-shadow 0.3s',
                      boxSizing: 'border-box',
                    }}>
                      <div style={{
                        width: '100%',
                        maxWidth: '100%',
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <img
                          src={item.img}
                          alt="Product"
                          style={{
                            cursor: 'pointer',
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: 12,
                            marginBottom: 12,
                            border: '2px solid #60a5fa',
                            background: '#101522',
                            display: 'block',
                            boxSizing: 'border-box',
                          }}
                          onClick={() => setZoomImg(item.img)}
                          onError={() => handleImageError(item.id)}
                          onContextMenu={e => e.preventDefault()}
                          onTouchStart={e => e.preventDefault()}
                          onDragStart={e => e.preventDefault()}
                          draggable={false}
                        />
                      </div>
                      <div className="store-info">
                        <span className="store-price">₹{item.price}</span>
                        {item.category === 'posters' && (
                          <div style={{ color: '#b3e0ff', fontWeight: 600, fontSize: '0.98em', marginBottom: 2 }}>Size : A3</div>
                        )}
                      </div>
                      <div className="store-actions">
                        {!inCart ? (
                          <button className={`store-btn`} onClick={() => handleAddToCart(item.id)}>
                            Add to Cart
                          </button>
                        ) : (
                          <button className={`store-btn remove`} onClick={() => handleRemoveFromCart(item.id)} style={{background: '#ff4d4d', color: '#fff'}}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
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
                <p><strong>Email:</strong> <a href="mailto:ank1t032718@gmail.com" style={{color: '#6ec1ff'}}>ank1t032718@gmail.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+919138442368" style={{color: '#6ec1ff'}}>+91 9138442368</a></p>
                {/* <p>Instagram: <a href="https://instagram.com/stickitize" target="_blank" rel="noopener" style={{color: '#6ec1ff'}}>@stickitize</a></p> */}
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
            
            {/* Policy Links */}
            <div style={{margin: '32px auto 0', maxWidth: '600px', textAlign: 'center'}}>
              <h4 style={{color: '#6ec1ff', marginBottom: '16px'}}>Legal Information</h4>
              <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px'}}>
                <button onClick={() => handleNav('privacy')} style={{background: 'transparent', color: '#6ec1ff', border: '1px solid #6ec1ff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.9em', cursor: 'pointer'}}>Privacy Policy</button>
                <button onClick={() => handleNav('terms')} style={{background: 'transparent', color: '#6ec1ff', border: '1px solid #6ec1ff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.9em', cursor: 'pointer'}}>Terms & Conditions</button>
                <button onClick={() => handleNav('refund')} style={{background: 'transparent', color: '#6ec1ff', border: '1px solid #6ec1ff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.9em', cursor: 'pointer'}}>Refund Policy</button>
                <button onClick={() => handleNav('shipping')} style={{background: 'transparent', color: '#6ec1ff', border: '1px solid #6ec1ff', borderRadius: '6px', padding: '8px 16px', fontSize: '0.9em', cursor: 'pointer'}}>Shipping Policy</button>
              </div>
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
                <button style={{background: '#6ec1ff', color: '#101828', border: 'none', borderRadius: '8px', padding: '10px 0', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer', width: '220px'}} onClick={handleAdminLogin} disabled={loading}>
                  {loading ? (
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24}}>
                      <span className="checkout-spinner" style={{width: 24, height: 24, border: '3px solid #6ec1ff', borderTop: '3px solid #101828', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite'}}></span>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
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
                        // Extract name and quantity
                        const nameMatch = stickerStr.match(/^(.*) \(x(\d+)\)$/);
                        let name = stickerStr;
                        let qty = 1;
                        if (nameMatch) {
                          name = nameMatch[1];
                          qty = parseInt(nameMatch[2], 10);
                        }
                        // Find the product by name in stickers only (remove undefined arrays)
                        const product = stickers.find(s => s.name === name);
                        // If it's a custom sticker, price is 10
                        const isCustom = name === 'Custom Sticker';
                        const price = isCustom ? 10 : product ? parseFloat(product.price) : 7;
                        adminOrderSubtotal += price * qty;
                      });
                      // Add delivery charge if applicable (free if subtotal >= 49)
                      const showDelivery = order.orderType === 'DELIVERY';
                      const deliveryCharge = (showDelivery && adminOrderSubtotal < 49) ? 10 : 0;
                      let total = adminOrderSubtotal;
                      if (showDelivery) total += deliveryCharge;
                      return (
                        <div key={idx} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#101828', borderRadius: '8px', padding: '12px 18px', marginBottom: 12}}>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0}}>
                            <span style={{color: '#fff', fontWeight: 'bold', fontSize: '1.1em'}}>{order.name}</span>
                            <span style={{color: '#b3e0ff', fontSize: '1em'}}>{order.phone}</span>
                            <span style={{color: '#6ec1ff', fontSize: '0.98em', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>
                              {order.stickers && order.stickers.map((sticker, i) => {
                                // Extract name
                                const nameMatch = sticker.match(/^(.*) \(x(\d+)\)$/);
                                let name = sticker;
                                if (nameMatch) {
                                  name = nameMatch[1];
                                }
                                const product = stickers.find(s => s.name === name);
                                const category = product ? categories[product.category]?.name || product.category : 'Unknown';
                                return (
                                  <span key={i}>{sticker} <span style={{color: '#60a5fa', fontSize: '0.95em', marginLeft: 4}}>[{category}]</span></span>
                                );
                              })}
                            </span>
                            <span style={{color: '#b3e0ff', fontSize: '0.98em'}}>Mode: {order.orderType}</span>
                            <span style={{color: '#b3e0ff', fontSize: '0.98em'}}>Payment: {order.payment || 'Pay on delivery/pickup'}{order.status ? ` • Status: ${order.status}` : ''}</span>
                            <span style={{color: '#b3e0ff', fontSize: '0.98em'}}>Address: {order.address}</span>
                            <span style={{color: '#2ecc40', fontWeight: 'bold', fontSize: '1.05em'}}>Total: ₹{total.toFixed(2)}{showDelivery && deliveryCharge > 0 ? ' (includes ₹10 delivery)' : showDelivery && deliveryCharge === 0 ? ' (Free delivery!)' : ''}</span>
                          </div>
                          <button style={{background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => handleClearOrder(order._id)} disabled={loading}>
                            {loading ? (
                              <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24}}>
                                <span className="checkout-spinner" style={{width: 24, height: 24, border: '3px solid #6ec1ff', borderTop: '3px solid #101828', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite'}}></span>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                              </span>
                            ) : (
                              'CLEAR'
                            )}
                          </button>
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
                            <button style={{background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => handleClearContact(msg._id)} disabled={loading}>
                              {loading ? (
                                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24}}>
                                  <span className="checkout-spinner" style={{width: 24, height: 24, border: '3px solid #6ec1ff', borderTop: '3px solid #101828', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite'}}></span>
                                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                </span>
                              ) : (
                                'CLEAR'
                              )}
                            </button>
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
        
        {/* Privacy Policy Page */}
        {page === 'privacy' && (
          <section className="privacy-page" id="privacy" style={{maxWidth: '800px', margin: '32px auto', background: 'rgba(30,40,60,0.95)', borderRadius: '16px', padding: '32px', boxShadow: '0 0 24px #0006'}}>
            <h2 style={{color: '#6ec1ff', marginBottom: '24px', textAlign: 'center'}}>Privacy Policy</h2>
            <div style={{color: '#fff', lineHeight: '1.6'}}>
              <p style={{marginBottom: '16px'}}><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>1. Information We Collect</h3>
              <p style={{marginBottom: '16px'}}>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Name and contact information</li>
                <li>Payment information (processed securely through Cashfree)</li>
                <li>Order history and preferences</li>
                <li>Communication records</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>2. How We Use Your Information</h3>
              <p style={{marginBottom: '16px'}}>We use the information we collect to:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders</li>
                <li>Provide customer support</li>
                <li>Improve our services</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>3. Information Sharing</h3>
              <p style={{marginBottom: '16px'}}>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>To process payments through Cashfree</li>
                <li>To fulfill orders through our delivery partners</li>
                <li>When required by law</li>
                <li>With your explicit consent</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>4. Data Security</h3>
              <p style={{marginBottom: '16px'}}>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>5. Your Rights</h3>
              <p style={{marginBottom: '16px'}}>You have the right to:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>6. Contact Us</h3>
              <p style={{marginBottom: '16px'}}>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p style={{marginBottom: '16px'}}>Email: <a href="mailto:ank1t032718@gmail.com" style={{color: '#6ec1ff'}}>ank1t032718@gmail.com</a></p>
              <p style={{marginBottom: '16px'}}>Phone: <a href="tel:+919138442368" style={{color: '#6ec1ff'}}>+91 9138442368</a></p>
              <p style={{marginBottom: '16px'}}>Business Owner: <strong>Ankit</strong></p>
              
              <div style={{marginTop: '32px', padding: '20px', background: 'rgba(110, 193, 255, 0.1)', borderRadius: '8px', border: '1px solid #6ec1ff'}}>
                <p style={{marginBottom: '16px', color: '#6ec1ff', fontWeight: 'bold'}}>For any queries, you can reach us at <strong>ank1t032718@gmail.com</strong> or call us at <strong>+91 9138442368</strong>.</p>
              </div>
            </div>
          </section>
        )}
        
        {/* Terms and Conditions Page */}
        {page === 'terms' && (
          <section className="terms-page" id="terms" style={{maxWidth: '800px', margin: '32px auto', background: 'rgba(30,40,60,0.95)', borderRadius: '16px', padding: '32px', boxShadow: '0 0 24px #0006'}}>
            <h2 style={{color: '#6ec1ff', marginBottom: '24px', textAlign: 'center'}}>Terms and Conditions</h2>
            <div style={{color: '#fff', lineHeight: '1.6'}}>
              <p style={{marginBottom: '16px'}}><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>1. Acceptance of Terms</h3>
              <p style={{marginBottom: '16px'}}>By accessing and using STICKITIZE's website and services, you accept and agree to be bound by these Terms and Conditions.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>2. Products and Services</h3>
              <p style={{marginBottom: '16px'}}>We offer high-quality stickers and related products. All products are subject to availability and may be discontinued without notice.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>3. Pricing and Payment</h3>
              <p style={{marginBottom: '16px'}}>All prices are in Indian Rupees (₹) and include applicable taxes. Payment is processed securely through Cashfree. We reserve the right to modify prices at any time.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>4. Order Processing</h3>
              <p style={{marginBottom: '16px'}}>Orders are processed upon receipt of payment confirmation. We will notify you of order status via email or phone.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>5. Intellectual Property</h3>
              <p style={{marginBottom: '16px'}}>All content on this website, including designs, logos, and product images, is the property of STICKITIZE and is protected by copyright laws.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>6. Limitation of Liability</h3>
              <p style={{marginBottom: '16px'}}>STICKITIZE shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>7. Governing Law</h3>
              <p style={{marginBottom: '16px'}}>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>8. Contact Information</h3>
              <p style={{marginBottom: '16px'}}>For questions about these terms, contact us at:</p>
              <p style={{marginBottom: '16px'}}>Email: <a href="mailto:ank1t032718@gmail.com" style={{color: '#6ec1ff'}}>ank1t032718@gmail.com</a></p>
              <p style={{marginBottom: '16px'}}>Phone: <a href="tel:+919138442368" style={{color: '#6ec1ff'}}>+91 9138442368</a></p>
              <p style={{marginBottom: '16px'}}>Business Owner: <strong>Ankit</strong></p>
              
              <div style={{marginTop: '32px', padding: '20px', background: 'rgba(110, 193, 255, 0.1)', borderRadius: '8px', border: '1px solid #6ec1ff'}}>
                <p style={{marginBottom: '16px', color: '#6ec1ff', fontWeight: 'bold'}}>For any queries, you can reach us at <strong>ank1t032718@gmail.com</strong> or call us at <strong>+91 9138442368</strong>.</p>
              </div>
            </div>
          </section>
        )}
        
        {/* Cancellation and Refund Policy Page */}
        {page === 'refund' && (
          <section className="refund-page" id="refund" style={{maxWidth: '800px', margin: '32px auto', background: 'rgba(30,40,60,0.95)', borderRadius: '16px', padding: '32px', boxShadow: '0 0 24px #0006'}}>
            <h2 style={{color: '#6ec1ff', marginBottom: '24px', textAlign: 'center'}}>Cancellation and Refund Policy</h2>
            <div style={{color: '#fff', lineHeight: '1.6'}}>
              <p style={{marginBottom: '16px'}}><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>1. Order Cancellation</h3>
              <p style={{marginBottom: '16px'}}>You may cancel your order within 2 hours of placing it, provided the order has not been processed for shipping. To cancel, contact us immediately.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>2. Refund Eligibility</h3>
              <p style={{marginBottom: '16px'}}>Refunds are available in the following cases:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Order cancelled within 2 hours of placement</li>
                <li>Product received in damaged condition</li>
                <li>Wrong product delivered</li>
                <li>Product quality issues</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>3. Refund Process</h3>
              <p style={{marginBottom: '16px'}}>To request a refund:</p>
              <ol style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Contact us within 48 hours of receiving your order</li>
                <li>Provide order details and reason for refund</li>
                <li>Include photos if applicable (for damaged products)</li>
                <li>We will review and process within 3-5 business days</li>
              </ol>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>4. Refund Timeline</h3>
              <p style={{marginBottom: '16px'}}>Once approved, refunds will be processed within 5-7 business days and credited to your original payment method.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>5. Non-Refundable Items</h3>
              <p style={{marginBottom: '16px'}}>The following are not eligible for refunds:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Custom or personalized stickers</li>
                <li>Products used or damaged by customer</li>
                <li>Orders cancelled after 2 hours</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>6. Contact Us</h3>
              <p style={{marginBottom: '16px'}}>For refund requests or questions, contact us at:</p>
              <p style={{marginBottom: '16px'}}>Email: <a href="mailto:ank1t032718@gmail.com" style={{color: '#6ec1ff'}}>ank1t032718@gmail.com</a></p>
              <p style={{marginBottom: '16px'}}>Phone: <a href="tel:+919138442368" style={{color: '#6ec1ff'}}>+91 9138442368</a></p>
              <p style={{marginBottom: '16px'}}>Business Owner: <strong>Ankit</strong></p>
              
              <div style={{marginTop: '32px', padding: '20px', background: 'rgba(110, 193, 255, 0.1)', borderRadius: '8px', border: '1px solid #6ec1ff'}}>
                <p style={{marginBottom: '16px', color: '#6ec1ff', fontWeight: 'bold'}}>For any queries, you can reach us at <strong>ank1t032718@gmail.com</strong> or call us at <strong>+91 9138442368</strong>.</p>
              </div>
            </div>
          </section>
        )}
        
        {/* Shipping and Delivery Policy Page */}
        {page === 'shipping' && (
          <section className="shipping-page" id="shipping" style={{maxWidth: '800px', margin: '32px auto', background: 'rgba(30,40,60,0.95)', borderRadius: '16px', padding: '32px', boxShadow: '0 0 24px #0006'}}>
            <h2 style={{color: '#6ec1ff', marginBottom: '24px', textAlign: 'center'}}>Shipping and Delivery Policy</h2>
            <div style={{color: '#fff', lineHeight: '1.6'}}>
              <p style={{marginBottom: '16px'}}><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>1. Delivery Areas</h3>
              <p style={{marginBottom: '16px'}}>We currently deliver to all major cities and towns across India. Delivery availability will be confirmed at checkout.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>2. Delivery Options</h3>
              <p style={{marginBottom: '16px'}}>We offer two delivery options:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li><strong>Standard Delivery:</strong> 3-5 business days (₹10 charge for orders under ₹49)</li>
                <li><strong>Express Delivery:</strong> 1-2 business days (₹25 additional charge)</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>3. Free Delivery</h3>
              <p style={{marginBottom: '16px'}}>Free standard delivery is available on orders of ₹49 and above.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>4. Order Processing</h3>
              <p style={{marginBottom: '16px'}}>Orders are typically processed within 24 hours of payment confirmation. You will receive tracking information via email/SMS.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>5. Delivery Partners</h3>
              <p style={{marginBottom: '16px'}}>We partner with reliable courier services including India Post, DTDC, and other regional couriers to ensure safe delivery.</p>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>6. Delivery Issues</h3>
              <p style={{marginBottom: '16px'}}>If you experience delivery issues:</p>
              <ul style={{marginLeft: '20px', marginBottom: '16px'}}>
                <li>Contact us immediately</li>
                <li>Provide order number and issue details</li>
                <li>We will coordinate with the courier to resolve</li>
              </ul>
              
              <h3 style={{color: '#6ec1ff', marginTop: '24px', marginBottom: '12px'}}>7. Contact Information</h3>
              <p style={{marginBottom: '16px'}}>For delivery-related queries, contact us at:</p>
              <p style={{marginBottom: '16px'}}>Email: <a href="mailto:ank1t032718@gmail.com" style={{color: '#6ec1ff'}}>ank1t032718@gmail.com</a></p>
              <p style={{marginBottom: '16px'}}>Phone: <a href="tel:+919138442368" style={{color: '#6ec1ff'}}>+91 9138442368</a></p>
              <p style={{marginBottom: '16px'}}>Business Owner: <strong>Ankit</strong></p>
              
              <div style={{marginTop: '32px', padding: '20px', background: 'rgba(110, 193, 255, 0.1)', borderRadius: '8px', border: '1px solid #6ec1ff'}}>
                <p style={{marginBottom: '16px', color: '#6ec1ff', fontWeight: 'bold'}}>For any queries, you can reach us at <strong>ank1t032718@gmail.com</strong> or call us at <strong>+91 9138442368</strong>.</p>
              </div>
            </div>
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
      {page !== 'admin' && (
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
      )}
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
          {cartDetails.length > 0 && pickupType === 'DELIVERY' && cartSubtotal < 49 && (
            <div style={{
              background: 'linear-gradient(90deg, #6ec1ff 0%, #4ade80 100%)',
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
              Add stickers worth <span style={{color: '#0a2342', fontWeight: 'bold'}}>₹{(49 - cartSubtotal).toFixed(2)}</span> for <span style={{color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8'}}>FREE delivery!</span>
              <style>{`@keyframes fadeInHighlight { from { opacity: 0; background: #fff; } to { opacity: 1; background: linear-gradient(90deg, #6ec1ff 0%,rgb(74, 222, 178) 100%); } }`}</style>
            </div>
          )}
          {cartDetails.length > 0 && pickupType === 'DELIVERY' && cartSubtotal >= 49 && (
            <div style={{
              background: 'linear-gradient(90deg, #4ade80 0%, #6ec1ff 100%)',
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
              🎉 You unlocked <span style={{color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8'}}>FREE delivery!</span>
              <style>{`@keyframes fadeInHighlight { from { opacity: 0; background: #fff; } to { opacity: 1; background: linear-gradient(90deg, #4ade80 0%, #6ec1ff 100%); } }`}</style>
            </div>
          )}
          <div style={{flex: 1, overflowY: 'auto', padding: '24px', marginBottom: isMobile ? 90 : 90}}>
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
                  <img
                    src={item.img}
                    alt={item.name}
                    style={{width: 80, height: 80, objectFit: 'cover', borderRadius: '10px', flexShrink: 0, cursor: 'pointer'}}
                    onClick={() => setZoomImg(item.img)}
                    onContextMenu={e => e.preventDefault()}
                    onTouchStart={e => e.preventDefault()}
                    onDragStart={e => e.preventDefault()}
                    draggable={false}
                  />
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
          {/* Fixed checkout bar at the bottom */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: isMobile ? '100vw' : 400,
            background: '#101828',
            borderTop: '1px solid #233',
            zIndex: 3100,
            padding: '18px 24px',
            boxSizing: 'border-box',
          }}>
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
        </div>
      )}
      {/* Checkout modal rendered globally so it always appears when showCheckout is true */}
      {showCheckout && (
        <div
          className="checkout-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: isMobile ? '#181c2a' : 'rgba(10,20,40,0.97)',
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'center',
            zIndex: 4000,
            boxSizing: 'border-box',
            minHeight: '100vh',
            maxWidth: '100vw',
            overflow: 'hidden'
          }}
        >
          {!isMobile ? (
            <div className="checkout-form-wrapper" style={{
              background: '#181c2a',
              borderRadius: '1.25rem',
              boxShadow: '0 8px 32px #0008',
              maxWidth: 500,
              width: '100%',
              margin: 'auto',
              position: 'relative',
              padding: '36px 36px 24px 36px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxHeight: '90vh',
              overflow: 'hidden',
              minHeight: '90vh'
            }}>
              {/* Close Button */}
              <button
                className="checkout-x"
                onClick={() => setShowCheckout(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(30,40,60,0.8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  fontSize: '1.4em',
                  cursor: 'pointer',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              {/* Header */}
              <div
                style={{
                  width: '100%',
                  padding: '32px 16px 12px 16px',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <h2
                  style={{
                    color: '#6ec1ff',
                    fontWeight: 700,
                    fontSize: '1.4em',
                    margin: 0,
                    letterSpacing: 1
                  }}
                >
                  Checkout
                </h2>
              </div>
              {/* Scrollable Content */}
              <div
                className="checkout-content-scroll"
                style={{
                  flex: 1,
                  width: '100%',
                  overflowY: 'auto',
                  padding: '0 16px 160px 16px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Order Summary */}
                <div
                  style={{
                    background: '#101828',
                    borderRadius: 10,
                    padding: '12px 12px',
                    marginBottom: 14,
                    marginTop: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <h3 style={{ color: '#b3e0ff', fontSize: '1em', marginBottom: 8, fontWeight: 600 }}>Order Summary</h3>
                  {cartDetails.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <img
                        src={item.img}
                        alt="Sticker"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 7,
                          objectFit: 'cover',
                          border: '1.5px solid #6ec1ff',
                          cursor: 'pointer'
                        }}
                        onClick={() => setZoomImg(item.img)}
                      />
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#b3e0ff', fontSize: '1em', marginLeft: 8 }}>x{item.qty}</span>
                      </div>
                      <span style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em' }}>
                        ₹{(parseFloat(item.price) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b3e0ff', fontWeight: 600, fontSize: '0.95em', marginBottom: 4 }}>
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  {pickupType === 'DELIVERY' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b3e0ff', fontWeight: 600, fontSize: '0.95em', marginBottom: 4 }}>
                      <span>Delivery</span>
                      <span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'Free'}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', fontWeight: 700, fontSize: '1.05em', marginTop: 6 }}>
                    <span>Total</span>
                    <span>₹{checkoutTotal.toFixed(2)}</span>
                  </div>
                  {/* Free Delivery Suggestion */}
                  {pickupType === 'DELIVERY' && cartSubtotal < 49 && (
                    <div style={{
                      background: 'linear-gradient(90deg, #6ec1ff 0%, #4ade80 100%)',
                      color: '#101828',
                      borderRadius: 10,
                      margin: '16px 0 0 0',
                      padding: '12px 16px',
                      fontWeight: 'bold',
                      fontSize: '0.95em',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px #10182822',
                      maxWidth: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      Add stickers worth <span style={{ color: '#0a2342', fontWeight: 'bold' }}>₹{(49 - cartSubtotal).toFixed(2)}</span> for <span style={{ color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8' }}>Free Delivery</span>!
                      <br />
                      <button
                        type="button"
                        onClick={() => { setShowCheckout(false); setPage('store'); }}
                        style={{
                          marginTop: 12,
                          background: '#6ec1ff',
                          color: '#101828',
                          border: 'none',
                          borderRadius: 7,
                          padding: '10px 24px',
                          fontWeight: 700,
                          fontSize: '0.95em',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px #10182810',
                          transition: 'background 0.2s'
                        }}
                      >
                        Add Stickers
                      </button>
                    </div>
                  )}
                  {pickupType === 'DELIVERY' && cartSubtotal >= 49 && (
                    <div style={{
                      background: 'linear-gradient(90deg, #4ade80 0%, #6ec1ff 100%)',
                      color: '#101828',
                      borderRadius: 10,
                      margin: '16px 0 0 0',
                      padding: '12px 16px',
                      fontWeight: 'bold',
                      fontSize: '0.95em',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px #10182822',
                      maxWidth: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      🎉 You unlocked <span style={{ color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8' }}>Free Delivery!</span>
                    </div>
                  )}
                </div>
                {/* Form */}
                <form
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'stretch',
                    marginTop: 0,
                    paddingBottom: '20px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Name */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 6, display: 'block' }}>Name *</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={orderName}
                      onChange={e => setOrderName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.7em 1em',
                        borderRadius: '0.75em',
                        border: '1.5px solid #6ec1ff',
                        background: '#101828',
                        color: '#fff',
                        fontSize: '1em',
                        boxShadow: '0 1px 4px #10182818',
                        outline: 'none',
                        transition: 'border 0.2s',
                        margin: 0
                      }}
                    />
                  </div>
                  {/* Phone */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Phone Number *</label>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, width: '100%' }}>
                      <div style={{
                        background: '#101828',
                        color: '#b3e0ff',
                        border: '1.5px solid #6ec1ff',
                        borderRadius: '0.75em',
                        padding: '0.7em 1em',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1em',
                        minWidth: '60px',
                        boxSizing: 'border-box'
                      }}>+91</div>
                      <input
                        type="tel"
                        placeholder="10-digit phone number"
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0,10)); }}
                        required
                        style={{
                          flex: 1,
                          boxSizing: 'border-box',
                          padding: '0.7em 1em',
                          borderRadius: '0.75em',
                          border: '1.5px solid #6ec1ff',
                          background: '#101828',
                          color: '#fff',
                          fontSize: '1em',
                          boxShadow: '0 1px 4px #10182818',
                          outline: 'none',
                          transition: 'border 0.2s',
                          margin: 0
                        }}
                      />
                    </div>
                    {!isValidPhone && phone && <span style={{ color: '#ff4d4d', fontSize: '0.95em' }}>Enter a valid 10-digit phone number.</span>}
                  </div>
                  {/* Order Type */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Order Type *</label>
                    <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', alignItems: 'flex-start', width: '100%' }}>
                      <label style={{ color: '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="pickupType" value="SELF-PICKUP" checked={pickupType === 'SELF-PICKUP'} onChange={e => { setPickupType(e.target.value); setOrderAddress('SELF-PICKUP'); }} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Self-pickup</span>
                      </label>
                      <label style={{ color: '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="pickupType" value="DELIVERY" checked={pickupType === 'DELIVERY'} onChange={e => { setPickupType(e.target.value); setOrderAddress(''); }} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Delivery</span>
                      </label>
                    </div>
                  </div>
                  {/* Delivery Address */}
                  {pickupType === 'DELIVERY' && (
                    <div style={{ width: '100%' }}>
                      <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Delivery Address *</label>
                      <select value={orderAddress} onChange={e => setOrderAddress(e.target.value)} required style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.7em 1em',
                        borderRadius: '8px',
                        border: '1.5px solid #6ec1ff',
                        background: '#101828',
                        color: '#fff',
                        fontSize: '1em',
                        boxShadow: '0 1px 4px #10182818',
                        outline: 'none',
                        transition: 'border 0.2s',
                        margin: 0
                      }}>
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
                      {!orderAddress && <span style={{ color: '#ff4d4d', fontSize: '0.95em' }}>Please select a delivery address.</span>}
                    </div>
                  )}
                  {/* Payment Method */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Payment Method *</label>
                    <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', alignItems: 'flex-start', width: '100%' }}>
                      <label style={{ color: '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="payment" value="Pay Online" checked={orderPayment === 'Pay Online'} onChange={e => setOrderPayment(e.target.value)} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Pay Online</span>
                      </label>
                      <label style={{ color: hasPosterInCart ? '#7aa4c7' : '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: hasPosterInCart ? 'not-allowed' : 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="payment" value="Pay on delivery/pickup" checked={orderPayment === 'Pay on delivery/pickup'} onChange={e => !hasPosterInCart && setOrderPayment(e.target.value)} disabled={hasPosterInCart} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Pay on delivery/pickup</span>
                      </label>
                    </div>
                    {hasPosterInCart && (
                      <div style={{ color: '#ffdd57', fontSize: '0.95em', marginTop: 8, padding: '8px 12px', background: 'rgba(255, 221, 87, 0.1)', borderRadius: '6px', border: '1px solid rgba(255, 221, 87, 0.3)' }}>
                        Only Pay Online is available when posters are in the cart.
                      </div>
                    )}
                    {paymentError && (
                      <div style={{ color: '#ff4d4d', fontSize: '0.95em', marginTop: 8, padding: '8px 12px', background: 'rgba(255, 77, 77, 0.1)', borderRadius: '6px', border: '1px solid rgba(255, 77, 77, 0.3)' }}>
                        {paymentError}
                      </div>
                    )}
                    {/* Remove extra secure payment banner when Pay Online is selected */}
                  </div>
                  {/* Privacy Note */}
                  {pickupType === 'SELF-PICKUP' && orderPayment !== 'Pay Online' && (
                    <div style={{
                      width: '100%',
                      maxWidth: 320,
                      margin: '0 auto',
                      background: '#101828',
                      color: '#b3e0ff',
                      borderRadius: '0.75em',
                      padding: '0.7em 1em',
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: '0.95em',
                      marginBottom: '-0.5em',
                      marginTop: 4
                    }}>
                      You'll receive a call for when to pick up your order from BH3.
                    </div>
                  )}
                </form>
              </div>
              {/* Sticky Place Order Button inside the card */}
              <div
                style={{
                  position: 'sticky',
                  bottom: 0,
                  width: '100%',
                  background: '#181c2a',
                  padding: '20px 16px',
                  boxSizing: 'border-box',
                  borderTop: '1.5px solid #233',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <button
                  type="button"
                  disabled={!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment || loading || paymentLoading}
                  onClick={orderPayment === 'Pay Online' ? handleOnlinePayment : handlePlaceOrder}
                  style={{
                    background: (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment || loading || paymentLoading) ? '#233' : '#6ec1ff',
                    color: '#101828',
                    border: 'none',
                    borderRadius: '0.75em',
                    padding: '1em 0',
                    fontWeight: 700,
                    fontSize: '1.05em',
                    cursor: (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment || loading || paymentLoading) ? 'not-allowed' : 'pointer',
                    width: '100%',
                    maxWidth: '100%',
                    boxShadow: '0 1px 4px #10182818',
                    transition: 'background 0.2s'
                  }}
                >
                  {(loading || paymentLoading) ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24 }}>
                      <span className="checkout-spinner" style={{ width: 24, height: 24, border: '3px solid #6ec1ff', borderTop: '3px solid #101828', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </span>
                  ) : (
                    orderPayment === 'Pay Online' ? 'Proceed to Payment' : 'Place Order'
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Mobile checkout code (scroll fix)
            <div
              className="checkout-form-wrapper"
              style={{
                width: '100vw',
                minHeight: '100vh',
                background: '#181c2a',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Close Button */}
              <button
                className="checkout-x"
                onClick={() => setShowCheckout(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(30,40,60,0.8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  fontSize: '1.4em',
                  cursor: 'pointer',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              {/* Header */}
              <div
                style={{
                  width: '100%',
                  padding: '32px 16px 12px 16px',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <h2
                  style={{
                    color: '#6ec1ff',
                    fontWeight: 700,
                    fontSize: '1.4em',
                    margin: 0,
                    letterSpacing: 1
                  }}
                >
                  Checkout
                </h2>
              </div>
              {/* Scrollable Content */}
              <div
                className="checkout-content-scroll"
                style={{
                  flex: 1,
                  width: '100%',
                  overflowY: 'auto',
                  padding: '0 16px 160px 16px',
                  boxSizing: 'border-box',
                  maxHeight: 'calc(100vh - 80px)', // <-- Make mobile checkout scrollable
                  minHeight: 0
                }}
              >
                {/* Order Summary */}
                <div
                  style={{
                    background: '#101828',
                    borderRadius: 10,
                    padding: '12px 12px',
                    marginBottom: 14,
                    marginTop: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <h3 style={{ color: '#b3e0ff', fontSize: '1em', marginBottom: 8, fontWeight: 600 }}>Order Summary</h3>
                  {cartDetails.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <img
                        src={item.img}
                        alt="Sticker"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 7,
                          objectFit: 'cover',
                          border: '1.5px solid #6ec1ff',
                          cursor: 'pointer'
                        }}
                        onClick={() => setZoomImg(item.img)}
                      />
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#b3e0ff', fontSize: '1em', marginLeft: 8 }}>x{item.qty}</span>
                      </div>
                      <span style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em' }}>
                        ₹{(parseFloat(item.price) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b3e0ff', fontWeight: 600, fontSize: '0.95em', marginBottom: 4 }}>
                    <span>Subtotal</span>
                    <span>₹{cartSubtotal.toFixed(2)}</span>
                  </div>
                  {pickupType === 'DELIVERY' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b3e0ff', fontWeight: 600, fontSize: '0.95em', marginBottom: 4 }}>
                      <span>Delivery</span>
                      <span>{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'Free'}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', fontWeight: 700, fontSize: '1.05em', marginTop: 6 }}>
                    <span>Total</span>
                    <span>₹{checkoutTotal.toFixed(2)}</span>
                  </div>
                  {/* Free Delivery Suggestion */}
                  {pickupType === 'DELIVERY' && cartSubtotal < 49 && (
                    <div style={{
                      background: 'linear-gradient(90deg, #6ec1ff 0%, #4ade80 100%)',
                      color: '#101828',
                      borderRadius: 10,
                      margin: '16px 0 0 0',
                      padding: '12px 16px',
                      fontWeight: 'bold',
                      fontSize: '0.95em',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px #10182822',
                      maxWidth: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      Add stickers worth <span style={{ color: '#0a2342', fontWeight: 'bold' }}>₹{(49 - cartSubtotal).toFixed(2)}</span> for <span style={{ color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8' }}>Free Delivery</span>!
                      <br />
                      <button
                        type="button"
                        onClick={() => { setShowCheckout(false); setPage('store'); }}
                        style={{
                          marginTop: 12,
                          background: '#6ec1ff',
                          color: '#101828',
                          border: 'none',
                          borderRadius: 7,
                          padding: '10px 24px',
                          fontWeight: 700,
                          fontSize: '0.95em',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px #10182810',
                          transition: 'background 0.2s'
                        }}
                      >
                        Add Stickers
                      </button>
                    </div>
                  )}
                  {pickupType === 'DELIVERY' && cartSubtotal >= 49 && (
                    <div style={{
                      background: 'linear-gradient(90deg, #4ade80 0%, #6ec1ff 100%)',
                      color: '#101828',
                      borderRadius: 10,
                      margin: '16px 0 0 0',
                      padding: '12px 16px',
                      fontWeight: 'bold',
                      fontSize: '0.95em',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px #10182822',
                      maxWidth: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      🎉 You unlocked <span style={{ color: '#059669', fontWeight: 'bold', textShadow: '0 1px 2px #fff8' }}>Free Delivery!</span>
                    </div>
                  )}
                </div>
                {/* Form */}
                <form
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'stretch',
                    marginTop: 0,
                    paddingBottom: '20px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Name */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 6, display: 'block' }}>Name *</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={orderName}
                      onChange={e => setOrderName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.7em 1em',
                        borderRadius: '0.75em',
                        border: '1.5px solid #6ec1ff',
                        background: '#101828',
                        color: '#fff',
                        fontSize: '1em',
                        boxShadow: '0 1px 4px #10182818',
                        outline: 'none',
                        transition: 'border 0.2s',
                        margin: 0
                      }}
                    />
                  </div>
                  {/* Phone */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Phone Number *</label>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 8, width: '100%' }}>
                      <div style={{
                        background: '#101828',
                        color: '#b3e0ff',
                        border: '1.5px solid #6ec1ff',
                        borderRadius: '0.75em',
                        padding: '0.7em 1em',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1em',
                        minWidth: '60px',
                        boxSizing: 'border-box'
                      }}>+91</div>
                      <input
                        type="tel"
                        placeholder="10-digit phone number"
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0,10)); }}
                        required
                        style={{
                          flex: 1,
                          boxSizing: 'border-box',
                          padding: '0.7em 1em',
                          borderRadius: '0.75em',
                          border: '1.5px solid #6ec1ff',
                          background: '#101828',
                          color: '#fff',
                          fontSize: '1em',
                          boxShadow: '0 1px 4px #10182818',
                          outline: 'none',
                          transition: 'border 0.2s',
                          margin: 0
                        }}
                      />
                    </div>
                    {!isValidPhone && phone && <span style={{ color: '#ff4d4d', fontSize: '0.95em' }}>Enter a valid 10-digit phone number.</span>}
                  </div>
                  {/* Order Type */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Order Type *</label>
                    <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', alignItems: 'flex-start', width: '100%' }}>
                      <label style={{ color: '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="pickupType" value="SELF-PICKUP" checked={pickupType === 'SELF-PICKUP'} onChange={e => { setPickupType(e.target.value); setOrderAddress('SELF-PICKUP'); }} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Self-pickup</span>
                      </label>
                      <label style={{ color: '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="pickupType" value="DELIVERY" checked={pickupType === 'DELIVERY'} onChange={e => { setPickupType(e.target.value); setOrderAddress(''); }} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Delivery</span>
                      </label>
                    </div>
                  </div>
                  {/* Delivery Address */}
                  {pickupType === 'DELIVERY' && (
                    <div style={{ width: '100%' }}>
                      <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Delivery Address *</label>
                      <select value={orderAddress} onChange={e => setOrderAddress(e.target.value)} required style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.7em 1em',
                        borderRadius: '8px',
                        border: '1.5px solid #6ec1ff',
                        background: '#101828',
                        color: '#fff',
                        fontSize: '1em',
                        boxShadow: '0 1px 4px #10182818',
                        outline: 'none',
                        transition: 'border 0.2s',
                        margin: 0
                      }}>
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
                      {!orderAddress && <span style={{ color: '#ff4d4d', fontSize: '0.95em' }}>Please select a delivery address.</span>}
                    </div>
                  )}
                  {/* Payment Method */}
                  <div style={{ width: '100%' }}>
                    <label style={{ color: '#6ec1ff', fontWeight: 600, fontSize: '1em', marginBottom: 4, display: 'block' }}>Payment Method *</label>
                    <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8em', alignItems: 'flex-start', width: '100%' }}>
                      <label style={{ color: '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="payment" value="Pay Online" checked={orderPayment === 'Pay Online'} onChange={e => setOrderPayment(e.target.value)} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Pay Online</span>
                      </label>
                      <label style={{ color: hasPosterInCart ? '#7aa4c7' : '#fff', fontWeight: 500, fontSize: '1em', display: 'flex', alignItems: 'center', gap: '0.7em', cursor: hasPosterInCart ? 'not-allowed' : 'pointer', padding: '8px 0' }}>
                        <input type="radio" name="payment" value="Pay on delivery/pickup" checked={orderPayment === 'Pay on delivery/pickup'} onChange={e => !hasPosterInCart && setOrderPayment(e.target.value)} disabled={hasPosterInCart} style={{ margin: 0, accentColor: '#6ec1ff', width: 20, height: 20 }} />
                        <span>Pay on delivery/pickup</span>
                      </label>
                    </div>
                    {hasPosterInCart && (
                      <div style={{ color: '#ffdd57', fontSize: '0.95em', marginTop: 8, padding: '8px 12px', background: 'rgba(255, 221, 87, 0.1)', borderRadius: '6px', border: '1px solid rgba(255, 221, 87, 0.3)' }}>
                        Only Pay Online is available when posters are in the cart.
                      </div>
                    )}
                    {paymentError && (
                      <div style={{ color: '#ff4d4d', fontSize: '0.95em', marginTop: 8, padding: '8px 12px', background: 'rgba(255, 77, 77, 0.1)', borderRadius: '6px', border: '1px solid rgba(255, 77, 77, 0.3)' }}>
                        {paymentError}
                      </div>
                    )}
                    {/* Remove extra secure payment banner when Pay Online is selected (mobile form) */}
                  </div>
                  {/* Privacy Note */}
                  {pickupType === 'SELF-PICKUP' && (
                    <div style={{
                      width: '100%',
                      maxWidth: 320,
                      margin: '0 auto',
                      background: '#101828',
                      color: '#b3e0ff',
                      borderRadius: '0.75em',
                      padding: '0.7em 1em',
                      textAlign: 'center',
                      fontWeight: 500,
                      fontSize: '0.95em',
                      marginBottom: '-0.5em',
                      marginTop: 4
                    }}>
                      You'll receive a call for when to pick up your order from BH3.
                    </div>
                  )}
                </form>
              </div>
              {/* Fixed Place Order Button at the bottom (mobile) */}
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  bottom: 0,
                  width: '100vw',
                  background: '#181c2a',
                  padding: '20px 16px',
                  boxSizing: 'border-box',
                  borderTop: '1.5px solid #233',
                  zIndex: 10,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <button
                  type="button"
                  disabled={!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment || loading || paymentLoading}
                  onClick={orderPayment === 'Pay Online' ? handleOnlinePayment : handlePlaceOrder}
                  style={{
                    background: (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment || loading || paymentLoading) ? '#233' : '#6ec1ff',
                    color: '#101828',
                    border: 'none',
                    borderRadius: '0.75em',
                    padding: '1em 0',
                    fontWeight: 700,
                    fontSize: '1.05em',
                    cursor: (!orderName || !isValidPhone || (pickupType === 'DELIVERY' && !orderAddress) || !orderPayment || loading || paymentLoading) ? 'not-allowed' : 'pointer',
                    width: '100%',
                    maxWidth: '100%',
                    boxShadow: '0 1px 4px #10182818',
                    transition: 'background 0.2s'
                  }}
                >
                  {(loading || paymentLoading) ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 24 }}>
                      <span className="checkout-spinner" style={{ width: 24, height: 24, border: '3px solid #6ec1ff', borderTop: '3px solid #101828', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </span>
                  ) : (
                    orderPayment === 'Pay Online' ? 'Proceed to Payment' : 'Place Order'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <footer>
        <p>&copy; 2025 STICKITIZE. All rights reserved.</p>
      </footer>
      <style>{`
        .featured-categories-scroll::-webkit-scrollbar { display: none; height: 0; }
        .featured-categories-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .fade-page {
          transition: background 0.5s cubic-bezier(.4,0,.2,1), color 0.5s cubic-bezier(.4,0,.2,1), box-shadow 0.5s cubic-bezier(.4,0,.2,1);
        }
        .page-content-fade {
          animation: fadeInPage 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}