import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const stickers = [
  {
    id: 1,
    name: "Minimalist Laptop Sticker",
    description: "Clean, modern design for your laptop",
    price: 99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
    tags: ["laptop", "minimalist", "modern"]
  },
  {
    id: 2,
    name: "Vintage Sticker Pack",
    description: "Set of 5 retro-inspired stickers",
    price: 149,
    image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=500&auto=format&fit=crop&q=60",
    tags: ["vintage", "pack", "retro"]
  },
  {
    id: 3,
    name: "Nature Collection",
    description: "Beautiful nature-inspired stickers",
    price: 199,
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&auto=format&fit=crop&q=60",
    tags: ["nature", "outdoors", "collection"]
  },
  {
    id: 4,
    name: "Tech Series",
    description: "Modern tech-themed stickers",
    price: 129,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60",
    tags: ["tech", "modern", "digital"]
  },
  {
    id: 5,
    name: "Artistic Expressions",
    description: "Unique artistic sticker designs",
    price: 179,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&auto=format&fit=crop&q=60",
    tags: ["art", "creative", "unique"]
  },
  {
    id: 6,
    name: "Pop Culture Pack",
    description: "Trending pop culture stickers",
    price: 159,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=60",
    tags: ["pop", "trending", "culture"]
  }
];

const tags = ["all", "laptop", "vintage", "nature", "tech", "art", "pop"];

function Stickers() {
  const [selectedTag, setSelectedTag] = useState("all");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleAddToCart = (sticker) => {
    const quantity = quantities[sticker.id] || 1;
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === sticker.id && item.type === 'sticker');
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: sticker.id,
        type: 'sticker',
        name: sticker.name,
        price: sticker.price,
        image: sticker.image,
        quantity
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${quantity} ${sticker.name} to cart!`);
  };

  const filteredStickers = stickers.filter(sticker => {
    const matchesTag = selectedTag === "all" || sticker.tags.includes(selectedTag);
    const matchesSearch =
      sticker.name.toLowerCase().includes(search.toLowerCase()) ||
      sticker.description.toLowerCase().includes(search.toLowerCase()) ||
      sticker.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
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
            Premium Stickers Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-200"
          >
            Express yourself with our high-quality, unique sticker designs
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stickers by name, tag, or description..."
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

        {/* Stickers Grid (Square aspect ratio, 4 per row on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStickers.map((sticker, index) => (
            <motion.div
              key={sticker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-slate-900/80 border-2 border-electric/30 rounded-xl overflow-hidden hover:border-electric transition-colors flex flex-col shadow-lg hover:shadow-2xl duration-300"
            >
              <div className="w-full" style={{ aspectRatio: '1/1' }}>
                <img
                  src={sticker.image}
                  alt={sticker.name}
                  className="object-cover w-full h-full rounded-t-xl group-hover:scale-105 transition-transform duration-300"
                  style={{ aspectRatio: '1/1' }}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{sticker.name}</h3>
                <p className="text-cyan-200 mb-2 text-sm sm:text-base">{sticker.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {sticker.tags.map(tag => (
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
                    <span className="text-lg font-bold text-electric">₹{sticker.price}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(sticker.id, Math.max(1, (quantities[sticker.id] || 1) - 1))}
                        className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-l hover:bg-slate-700 font-bold text-lg focus:outline-none"
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="px-4 py-1 bg-slate-900 text-white border border-slate-700 font-semibold min-w-[2.5rem] text-center rounded-none">
                        {quantities[sticker.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(sticker.id, (quantities[sticker.id] || 1) + 1)}
                        className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-r hover:bg-slate-700 font-bold text-lg focus:outline-none"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => handleAddToCart(sticker)}
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
        {filteredStickers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-cyan-200 text-lg">No stickers found for this search or category.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Stickers; 