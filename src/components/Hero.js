import React from 'react';

function Hero() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-slate-800 to-slate-900">
      {/* Animated floating blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-electric/20 rounded-full filter blur-2xl animate-blob" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 -right-32 w-80 h-80 bg-cyan/20 rounded-full filter blur-2xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-electric/10 rounded-full filter blur-2xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp">
          <span className="block mb-2">Stickitize</span>
          <span className="block text-electric">The Vibe You Can Peel & Stick</span>
        </h1>
        <p className="text-lg sm:text-xl text-cyan-100 mb-8 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          Custom & curated stickers/posters for your campus
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <button className="px-8 py-3 bg-gradient-to-r from-electric to-cyan text-white rounded-full font-medium shadow-neon-btn hover:scale-105 hover:shadow-neon transition-all duration-300">
            Shop Now
          </button>
          <button className="px-8 py-3 bg-slate-800/80 border border-cyan text-cyan-100 rounded-full font-medium hover:bg-slate-700 hover:text-white hover:shadow-neon transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
      {/* Decorative bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </div>
  );
}

export default Hero; 