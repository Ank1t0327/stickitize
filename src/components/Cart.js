import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="group bg-slate-900/80 border-2 border-electric rounded-xl p-4 mb-4 shadow-neon hover:shadow-neon-btn transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden border-2 border-cyan-700 bg-slate-800">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Product Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-electric transition-colors duration-200">
                {item.name}
              </h3>
              <p className="text-cyan-400 text-sm mt-1">
                {item.isCustom ? 'Custom Design' : 'Pre-made Design'}
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-cyan-400 hover:text-white hover:shadow-neon-btn transition-all duration-200 rounded-full p-1 border border-transparent hover:border-cyan-400"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          {/* Price and Quantity */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
            <div className="text-electric font-semibold">
              ₹{item.price}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border-2 border-cyan-700 rounded-full overflow-hidden bg-slate-800/60">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="px-3 py-1 text-cyan-400 hover:text-white hover:bg-slate-900 transition-colors duration-200"
                >
                  -
                </button>
                <span className="px-3 py-1 text-white">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-1 text-cyan-400 hover:text-white hover:bg-slate-900 transition-colors duration-200"
                >
                  +
                </button>
              </div>
              <div className="text-white">
                Total: <span className="text-electric font-bold">₹{item.price * item.quantity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎨</div>
      <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-[0_0_8px_#3b82f6]">Your vibe vault is empty!</h2>
      <p className="text-cyan-400 mb-6">Add some fire 🔥 to your collection</p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-gradient-to-r from-electric to-cyan text-white rounded-full font-medium shadow-neon-btn hover:scale-105 hover:shadow-neon transition-all duration-300"
      >
        Start Shopping
      </a>
    </div>
  );
}

function Cart() {
  const navigate = useNavigate();
  // TODO: Replace with actual cart state management
  const cartItems = [
    {
      id: 1,
      name: "Minimalist Laptop Sticker",
      price: 99,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
      isCustom: false
    },
    {
      id: 2,
      name: "Custom Poster",
      price: 399,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=500&auto=format&fit=crop&q=60",
      isCustom: true
    }
  ];

  const handleUpdateQuantity = (itemId, newQuantity) => {
    // TODO: Implement quantity update logic
    console.log(`Update quantity for item ${itemId} to ${newQuantity}`);
  };

  const handleRemoveItem = (itemId) => {
    // TODO: Implement remove item logic
    console.log(`Remove item ${itemId}`);
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
            {/* Cart Summary */}
            <div className="mt-8 bg-slate-900/80 border-2 border-electric rounded-xl p-6 shadow-neon animate-pulseGlow">
              <div className="flex justify-between items-center mb-6">
                <span className="text-cyan-200">Subtotal</span>
                <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_#3b82f6]">₹{subtotal}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gradient-to-r from-electric to-cyan text-white rounded-full font-medium shadow-neon-btn hover:scale-105 hover:shadow-neon transition-all duration-300 text-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart; 