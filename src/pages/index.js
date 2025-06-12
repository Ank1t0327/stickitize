import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

const featuredProducts = [
  {
    id: 1,
    name: "Minimalist Laptop Sticker",
    price: 99,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
    category: "stickers"
  },
  {
    id: 2,
    name: "Custom Poster",
    price: 399,
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&auto=format&fit=crop&q=60",
    category: "posters"
  },
  {
    id: 3,
    name: "Vintage Sticker Pack",
    price: 149,
    image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=500&auto=format&fit=crop&q=60",
    category: "stickers"
  }
];

const categories = [
  {
    name: "Stickers",
    description: "Express yourself with our premium quality stickers",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
    link: "/stickers"
  },
  {
    name: "Posters",
    description: "Transform your space with our artistic posters",
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&auto=format&fit=crop&q=60",
    link: "/posters"
  },
  {
    name: "Custom Design",
    description: "Create your own unique designs",
    image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=500&auto=format&fit=crop&q=60",
    link: "/custom-design"
  }
];

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-grid opacity-10"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Stickitize Your World
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-cyan-200 mb-8"
          >
            The Vibe You Can Peel & Stick
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/stickers" className="px-8 py-3 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors">
              Explore Stickers
            </Link>
            <Link to="/custom-design" className="px-8 py-3 bg-transparent border-2 border-electric text-electric rounded-lg font-medium hover:bg-electric/10 transition-colors">
              Create Custom Design
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Explore Our Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="group relative overflow-hidden rounded-xl bg-slate-900/80 border-2 border-electric/30 hover:border-electric transition-colors"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-cyan-200 mb-4">{category.description}</p>
                  <Link
                    to={category.link}
                    className="inline-flex items-center text-electric hover:text-cyan-400 transition-colors"
                  >
                    Explore Collection
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Featured Products</h2>
            <Link
              to="/stickers"
              className="inline-flex items-center text-electric hover:text-cyan-400 transition-colors"
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="group bg-slate-900/80 border-2 border-electric/30 rounded-xl overflow-hidden hover:border-electric transition-colors"
              >
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-cyan-200 mb-4">₹{product.price}</p>
                  <button className="w-full py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Choose Stickitize?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-6 text-center">
              <SparklesIcon className="w-12 h-12 text-electric mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
              <p className="text-cyan-200">High-quality materials that last longer and look better</p>
            </div>
            <div className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-6 text-center">
              <SparklesIcon className="w-12 h-12 text-electric mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Custom Designs</h3>
              <p className="text-cyan-200">Create your own unique designs with our custom design tool</p>
            </div>
            <div className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-6 text-center">
              <SparklesIcon className="w-12 h-12 text-electric mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Fast Delivery</h3>
              <p className="text-cyan-200">Quick processing and delivery to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Stickitize Your World?</h2>
          <p className="text-cyan-200 mb-8">Join thousands of happy customers who have transformed their spaces with our products</p>
          <Link
            to="/custom-design"
            className="inline-flex items-center px-8 py-3 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors"
          >
            Start Creating
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home; 