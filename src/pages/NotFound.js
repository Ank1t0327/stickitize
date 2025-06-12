import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <h1 className="text-6xl sm:text-7xl font-extrabold text-electric drop-shadow-[0_0_16px_#3b82f6] mb-6 animate-pulseGlow text-center">
        404
      </h1>
      <p className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
        Oops, looks like you sticker-bombed the wrong page.
      </p>
      <p className="text-cyan-200 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or got peeled away. Let's get you back to the fun!
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-electric text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-cyan-500 transition-colors animate-glow"
      >
        Return Home
      </Link>
    </div>
  );
}

export default NotFound; 