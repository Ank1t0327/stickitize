import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'thankyou'
  const [orderId, setOrderId] = useState(null);
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    delivery: 'Home Delivery',
    payment: 'Cash on Delivery',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(stored);
  }, []);

  const updateQuantity = (id, type, delta) => {
    const updated = cart.map(item =>
      item.id === id && item.type === type ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id, type) => {
    const updated = cart.filter(item => !(item.id === id && item.type === type));
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- BUY Modal Logic ---
  const validate = () => {
    const errs = {};
    if (!customer.name.trim()) errs.name = 'Name is required';
    if (!customer.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = 'Valid email required';
    if (!customer.phone.match(/^\d{10}$/)) errs.phone = '10-digit phone required';
    if (!customer.address.trim()) errs.address = 'Address is required';
    return errs;
  };
  const handleBuy = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Simulate order placement
      const newOrderId = 'STK' + Date.now().toString().slice(-6);
      setOrderId(newOrderId);
      setStep('thankyou');
      localStorage.removeItem('cart');
      setCart([]);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyan-200 text-lg mb-4">Your cart is empty!</p>
            <Link to="/stickers" className="text-electric underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map(item => (
              <div key={item.type + item.id} className="flex items-center gap-4 bg-slate-900/80 border border-slate-700 rounded-lg p-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-white">{item.name}</h2>
                  <p className="text-cyan-200 text-xs mb-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-electric font-bold">₹{item.price}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.id, item.type, -1)} className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-l hover:bg-slate-700 font-bold text-lg">-</button>
                      <span className="px-3 py-1 bg-slate-900 text-white border border-slate-700 font-semibold min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.type, 1)} className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-r hover:bg-slate-700 font-bold text-lg">+</button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.type)}
                      className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">Subtotal: ₹{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-8">
              <div className="bg-slate-800 rounded-lg px-6 py-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <span className="text-xl font-bold text-white">Total: </span>
                <span className="text-xl font-bold text-electric">₹{total}</span>
                <button
                  className="ml-auto px-6 py-3 bg-electric text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-cyan-500 transition-colors animate-glow"
                  onClick={() => setShowModal(true)}
                >
                  BUY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUY Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 relative animate-fadeInUp">
              <button
                className="absolute top-4 right-4 text-cyan-200 hover:text-electric text-2xl font-bold"
                onClick={() => { setShowModal(false); setStep('form'); setErrors({}); }}
                aria-label="Close"
              >×</button>
              {step === 'form' && (
                <form onSubmit={handleBuy} className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-2">Customer Information</h2>
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={customer.name}
                      onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                      className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-electric"
                    />
                    {errors.name && <div className="text-red-400 text-xs mt-1">{errors.name}</div>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={customer.email}
                      onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-electric"
                    />
                    {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone (10 digits)"
                      value={customer.phone}
                      onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
                      className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-electric"
                    />
                    {errors.phone && <div className="text-red-400 text-xs mt-1">{errors.phone}</div>}
                  </div>
                  <div>
                    <textarea
                      placeholder="Delivery Address"
                      value={customer.address}
                      onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))}
                      className="w-full px-4 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-electric"
                      rows={2}
                    />
                    {errors.address && <div className="text-red-400 text-xs mt-1">{errors.address}</div>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-cyan-200 mb-1">Delivery Method</label>
                      <select
                        value={customer.delivery}
                        onChange={e => setCustomer(c => ({ ...c, delivery: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-electric"
                      >
                        <option>Home Delivery</option>
                        <option>Store Pickup</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-cyan-200 mb-1">Payment Method</label>
                      <select
                        value={customer.payment}
                        onChange={e => setCustomer(c => ({ ...c, payment: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-electric"
                      >
                        <option>Cash on Delivery</option>
                        <option>Online Payment</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 px-6 py-3 bg-electric text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-cyan-500 transition-colors animate-glow"
                  >
                    Confirm Order
                  </button>
                </form>
              )}
              {step === 'thankyou' && (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-electric mb-2">Thank You for Your Order!</h2>
                  <p className="text-white">Your order <span className="font-mono text-cyan-200">{orderId}</span> has been placed.</p>
                  <div className="bg-slate-800 rounded-lg p-4 text-left text-cyan-200">
                    <div><span className="font-semibold text-white">Name:</span> {customer.name}</div>
                    <div><span className="font-semibold text-white">Email:</span> {customer.email}</div>
                    <div><span className="font-semibold text-white">Phone:</span> {customer.phone}</div>
                    <div><span className="font-semibold text-white">Address:</span> {customer.address}</div>
                    <div><span className="font-semibold text-white">Delivery:</span> {customer.delivery}</div>
                    <div><span className="font-semibold text-white">Payment:</span> {customer.payment}</div>
                  </div>
                  <Link to="/" className="inline-block mt-4 px-6 py-3 bg-electric text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-cyan-500 transition-colors">Return Home</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart; 