import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900">
      <Navbar />
      <div className="pt-16">
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp; 