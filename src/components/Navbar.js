import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/stickers', label: 'Stickers' },
  { to: '/posters', label: 'Posters' },
  { to: '/order-history', label: 'Order History' },
  { to: '/custom-design', label: 'Custom Design' },
  { to: '/track-order', label: 'Track Order' },
  { to: '/admin-login', label: 'Admin Login' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(stored.length);
  }, [location]);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 shadow-neon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-electric flex-1">
            {/* SVG sticker icon */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-neon animate-float">
              <rect x="3" y="3" width="22" height="22" rx="6" fill="#3b82f6" fillOpacity="0.7"/>
              <circle cx="14" cy="14" r="7" fill="#06b6d4" fillOpacity="0.8"/>
              <rect x="8" y="8" width="12" height="12" rx="3" fill="#fff" fillOpacity="0.7"/>
            </svg>
            Stickitize
          </Link>
          {/* Cart Icon (Mobile) */}
          <Link to="/cart" className="relative md:hidden ml-2 order-3 group">
            <ShoppingCartIcon className="w-6 h-6 text-cyan-200 group-hover:text-electric transition-colors drop-shadow-neon" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-electric text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulseGlow">
                {cartCount}
              </span>
            )}
          </Link>
          {/* Hamburger Icon */}
          <button
            className="md:hidden text-cyan-200 hover:text-electric transition-colors text-3xl px-2 ml-auto order-2"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="hidden md:flex items-center gap-6 justify-end flex-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-cyan-200 hover:text-electric transition-colors px-3 py-1 rounded text-base font-medium whitespace-nowrap drop-shadow-neon ${location.pathname === link.to ? 'bg-electric/20 text-electric font-bold shadow-neon' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/cart" className="relative ml-4 group">
              <ShoppingCartIcon className="w-6 h-6 text-cyan-200 group-hover:text-electric transition-colors drop-shadow-neon" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-electric text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulseGlow">
                  {cartCount}
                </span>
              )}
            </Link>
            {/* User/Account Dropdown */}
            <div className="relative ml-4">
              <button
                className="flex items-center text-cyan-200 hover:text-electric transition-colors focus:outline-none drop-shadow-neon"
                aria-label="Account menu"
                onClick={() => setUserDropdown(v => !v)}
                onBlur={() => setTimeout(() => setUserDropdown(false), 150)}
              >
                <UserCircleIcon className="w-7 h-7" />
              </button>
              {userDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-neon py-2 z-50 animate-fadeInUp">
                  <Link to="/order-history" className="block px-4 py-2 text-cyan-200 hover:bg-slate-800 hover:text-electric transition-colors" onClick={()=>setUserDropdown(false)}>Order History</Link>
                  <Link to="/track-order" className="block px-4 py-2 text-cyan-200 hover:bg-slate-800 hover:text-electric transition-colors" onClick={()=>setUserDropdown(false)}>Track Order</Link>
                  <button className="block w-full text-left px-4 py-2 text-cyan-200 hover:bg-slate-800 hover:text-electric transition-colors">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        {/* Slide-in Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-4/5 max-w-xs z-50 bg-black shadow-2xl flex flex-col rounded-l-2xl pt-0 pb-8 px-0 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Top bar inside panel */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 rounded-tl-2xl">
            <span className="text-2xl font-bold text-electric">Stickitize</span>
            <button
              className="text-electric text-4xl font-bold hover:text-cyan-400 transition-colors focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
            >
              ×
            </button>
          </div>
          <nav className="flex flex-col flex-1 justify-center w-full">
            {navLinks.map((link, idx) => (
              <Link
                key={link.to}
                to={link.to}
                className={`w-full text-right text-white text-xl font-semibold px-8 py-5 focus:bg-slate-800 focus:outline-none transition-colors ${idx !== navLinks.length - 1 ? 'border-b border-slate-800' : ''} hover:bg-slate-900`}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 