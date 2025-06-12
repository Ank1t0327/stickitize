import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

function Home() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-white mb-6"
          >
            Welcome to Stickitize
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-cyan-200 mb-8"
          >
            Your one-stop shop for premium stickers and posters
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Link
              to="/stickers"
              className="px-6 py-3 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors"
            >
              Shop Stickers
            </Link>
            <Link
              to="/posters"
              className="px-6 py-3 bg-slate-800 text-cyan-200 rounded-lg font-medium hover:bg-slate-700 transition-colors"
            >
              View Posters
            </Link>
          </motion.div>
        </div>

        {/* Featured Products Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Featured Products</h2>
          <div className="overflow-x-auto flex gap-6 pb-2 hide-scrollbar">
            {[{
              name: 'Minimalist Laptop Sticker',
              image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop&q=60',
              price: 99,
              link: '/stickers'
            }, {
              name: 'Abstract Waves Poster',
              image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=60',
              price: 499,
              link: '/posters'
            }, {
              name: 'Vintage Sticker Pack',
              image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=60',
              price: 149,
              link: '/stickers'
            }].map((item, idx) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.04 }}
                className="min-w-[220px] bg-slate-900/80 border-2 border-electric/30 rounded-xl overflow-hidden shadow hover:shadow-xl transition-all"
              >
                <img src={item.image} alt={item.name} className="object-cover w-full h-40" />
                <div className="p-4 flex flex-col items-center">
                  <div className="text-lg font-semibold text-white mb-1 text-center">{item.name}</div>
                  <div className="text-electric font-bold mb-2">₹{item.price}</div>
                  <Link to={item.link} className="px-4 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors text-sm">View</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Featured Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-900/80 border-2 border-electric/30 rounded-xl overflow-hidden hover:border-electric transition-colors"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60"
                alt="Stickers"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Premium Stickers</h2>
              <p className="text-cyan-200 mb-6">
                Express yourself with our high-quality, unique sticker designs. Perfect for laptops, water bottles, and more.
              </p>
              <Link
                to="/stickers"
                className="inline-flex items-center text-electric hover:text-cyan-400 transition-colors"
              >
                Explore Stickers
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-900/80 border-2 border-electric/30 rounded-xl overflow-hidden hover:border-electric transition-colors"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60"
                alt="Posters"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Art Gallery Posters</h2>
              <p className="text-cyan-200 mb-6">
                Transform your space with our premium art posters. From abstract to nature, find the perfect piece for your walls.
              </p>
              <Link
                to="/posters"
                className="inline-flex items-center text-electric hover:text-cyan-400 transition-colors"
              >
                View Posters
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              name: 'Aarav S.',
              text: 'Absolutely love the quality and designs! My laptop looks amazing now.',
              avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
            }, {
              name: 'Priya M.',
              text: 'The posters transformed my room. Fast delivery and great service!',
              avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
            }, {
              name: 'Rahul K.',
              text: 'Custom design process was super easy. Highly recommend Stickitize!',
              avatar: 'https://randomuser.me/api/portraits/men/65.jpg'
            }].map((t, idx) => (
              <motion.div
                key={t.name}
                whileHover={{ scale: 1.03 }}
                className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 flex flex-col items-center shadow hover:shadow-lg transition-all"
              >
                <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-3 border-2 border-electric" />
                <div className="text-cyan-200 text-center mb-2">"{t.text}"</div>
                <div className="text-white font-semibold">{t.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Custom Design Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Create Your Own Design</h2>
          <p className="text-cyan-200 mb-8 max-w-2xl mx-auto">
            Have a unique design in mind? Upload your artwork and we'll help you create the perfect sticker or poster.
          </p>
          <Link
            to="/custom-design"
            className="inline-block px-6 py-3 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors"
          >
            Start Creating
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default Home; 