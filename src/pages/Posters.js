import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const posters = [
  {
    id: 1,
    name: "Abstract Waves",
    description: "Modern abstract art poster with flowing waves",
    price: 499,
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60",
    tags: ["abstract", "modern", "art"]
  },
  {
    id: 2,
    name: "Mountain Sunset",
    description: "Breathtaking mountain landscape at sunset",
    price: 599,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60",
    tags: ["nature", "landscape", "sunset"]
  },
  {
    id: 3,
    name: "Urban Night",
    description: "City lights and urban atmosphere",
    price: 549,
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&auto=format&fit=crop&q=60",
    tags: ["urban", "city", "night"]
  },
  {
    id: 4,
    name: "Minimalist Design",
    description: "Clean and simple geometric patterns",
    price: 449,
    image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=500&auto=format&fit=crop&q=60",
    tags: ["minimalist", "geometric", "modern"]
  },
  {
    id: 5,
    name: "Ocean Dreams",
    description: "Serene ocean waves and beach scene",
    price: 529,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=60",
    tags: ["ocean", "beach", "nature"]
  },
  {
    id: 6,
    name: "Space Exploration",
    description: "Cosmic journey through the stars",
    price: 579,
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=60",
    tags: ["space", "cosmic", "stars"]
  }
];

const tags = ["all", "abstract", "nature", "urban", "minimalist", "ocean", "space"];

function Posters() {
  const [selectedTag, setSelectedTag] = useState("all");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleAddToCart = (poster) => {
    const quantity = quantities[poster.id] || 1;
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === poster.id && item.type === 'poster');
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: poster.id,
        type: 'poster',
        name: poster.name,
        price: poster.price,
        image: poster.image,
        quantity
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${quantity} ${poster.name} to cart!`);
  };

  const filteredPosters = posters.filter(poster => {
    const matchesTag = selectedTag === "all" || poster.tags.includes(selectedTag);
    const matchesSearch =
      poster.name.toLowerCase().includes(search.toLowerCase()) ||
      poster.description.toLowerCase().includes(search.toLowerCase()) ||
      poster.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Art Gallery Posters
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-200"
          >
            Transform your space with our premium art posters
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posters by name, tag, or description..."
              className="w-full px-4 py-2 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-electric"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-cyan-200 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tags.map((tag, index) => (
            <motion.button
              key={tag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
                selectedTag === tag
                  ? "bg-electric text-white"
                  : "bg-slate-800 text-cyan-200 hover:bg-slate-700"
              }`}
            >
              <TagIcon className="w-4 h-4" />
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Posters Grid (A4 aspect ratio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredPosters.map((poster, index) => (
            <motion.div
              key={poster.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-slate-900/80 border-2 border-electric/30 rounded-xl overflow-hidden hover:border-electric transition-colors flex flex-col shadow-lg hover:shadow-2xl duration-300"
            >
              <div className="w-full" style={{ aspectRatio: '3/4' }}>
                <img
                  src={poster.image}
                  alt={poster.name}
                  className="object-cover w-full h-full rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{poster.name}</h3>
                <p className="text-cyan-200 mb-2 text-sm sm:text-base">{poster.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {poster.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-800 text-cyan-200 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-electric">₹{poster.price}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(poster.id, Math.max(1, (quantities[poster.id] || 1) - 1))}
                        className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-l hover:bg-slate-700 font-bold text-lg focus:outline-none"
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="px-4 py-1 bg-slate-900 text-white border border-slate-700 font-semibold min-w-[2.5rem] text-center rounded-none">
                        {quantities[poster.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(poster.id, (quantities[poster.id] || 1) + 1)}
                        className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-r hover:bg-slate-700 font-bold text-lg focus:outline-none"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleAddToCart(poster)}
                    className="w-full px-3 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 focus:ring-2 focus:ring-cyan-400 transition-all flex items-center justify-center gap-2 text-sm shadow hover:shadow-lg"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-cyan-200 text-lg">No posters found for this search or category.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Posters; 