import React, { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ChartBarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const initialStickers = [
  { id: 1, name: 'Minimalist Laptop Sticker', price: 99, image: '', },
  { id: 2, name: 'Vintage Sticker Pack', price: 149, image: '', },
];
const initialPosters = [
  { id: 1, name: 'Abstract Waves', price: 499, image: '', },
  { id: 2, name: 'Mountain Sunset', price: 599, image: '', },
];
const mockOrders = [
  { id: 101, customer: 'Alice', total: 299, status: 'Completed', date: '2024-05-01' },
  { id: 102, customer: 'Bob', total: 499, status: 'Pending', date: '2024-05-02' },
];

function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [stickers, setStickers] = useState(initialStickers);
  const [posters, setPosters] = useState(initialPosters);
  const [newSticker, setNewSticker] = useState({ name: '', price: '', image: '' });
  const [newPoster, setNewPoster] = useState({ name: '', price: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [admin] = useState({ name: 'Admin', email: 'admin@stickitize.com' });

  // Add, edit, delete logic
  const addSticker = () => {
    if (!newSticker.name || !newSticker.price) return;
    setStickers([...stickers, { ...newSticker, id: Date.now() }]);
    setNewSticker({ name: '', price: '', image: '' });
  };
  const addPoster = () => {
    if (!newPoster.name || !newPoster.price) return;
    setPosters([...posters, { ...newPoster, id: Date.now() }]);
    setNewPoster({ name: '', price: '', image: '' });
  };
  const deleteSticker = id => setStickers(stickers.filter(s => s.id !== id));
  const deletePoster = id => setPosters(posters.filter(p => p.id !== id));
  const updateStickerQty = (id, delta) => {
    setStickers(stickers => stickers.map(s => s.id === id ? { ...s, qty: Math.max(1, (s.qty || 1) + delta) } : s));
  };
  const updatePosterQty = (id, delta) => {
    setPosters(posters => posters.map(p => p.id === id ? { ...p, qty: Math.max(1, (p.qty || 1) + delta) } : p));
  };

  // Responsive tabbed layout
  return (
    <div className="min-h-screen py-8 px-2 sm:px-4 bg-slate-950">
      <div className="max-w-5xl mx-auto">
        {/* Admin Profile & Logout */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <UserCircleIcon className="w-10 h-10 text-cyan-400" />
            <div>
              <div className="text-lg font-bold text-white">{admin.name}</div>
              <div className="text-cyan-200 text-sm">{admin.email}</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-cyan-200 rounded-lg hover:bg-slate-700 transition-colors font-medium">
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-800 overflow-x-auto">
          <button onClick={() => setTab('products')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${tab === 'products' ? 'bg-slate-900 text-electric' : 'text-cyan-200 hover:bg-slate-800'}`}>Products</button>
          <button onClick={() => setTab('orders')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${tab === 'orders' ? 'bg-slate-900 text-electric' : 'text-cyan-200 hover:bg-slate-800'}`}>Orders</button>
          <button onClick={() => setTab('analytics')} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${tab === 'analytics' ? 'bg-slate-900 text-electric' : 'text-cyan-200 hover:bg-slate-800'}`}>Analytics</button>
        </div>
        {/* Tab Content */}
        {tab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stickers */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><ShoppingBagIcon className="w-6 h-6 text-cyan-400" />Stickers</h2>
              <div className="mb-4 flex flex-col gap-2">
                <input type="text" placeholder="Sticker Name" value={newSticker.name} onChange={e => setNewSticker(s => ({ ...s, name: e.target.value }))} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700" />
                <input type="number" placeholder="Price" value={newSticker.price} onChange={e => setNewSticker(s => ({ ...s, price: e.target.value }))} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700" />
                <input type="file" accept="image/*" onChange={e => setNewSticker(s => ({ ...s, image: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : '' }))} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700" />
                <button onClick={addSticker} className="w-full bg-electric text-white rounded px-3 py-2 font-medium hover:bg-cyan-500 flex items-center justify-center gap-2"><PlusIcon className="w-5 h-5" />Add Sticker</button>
              </div>
              <ul className="divide-y divide-slate-700">
                {stickers.map(sticker => (
                  <li key={sticker.id} className="py-2 flex items-center gap-3 text-white">
                    {sticker.image && <img src={sticker.image} alt="" className="w-10 h-10 object-cover rounded" />}
                    <span className="flex-1">{sticker.name}</span>
                    <span>₹{sticker.price}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => updateStickerQty(sticker.id, -1)} className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-l hover:bg-slate-700 font-bold text-lg">-</button>
                      <span className="px-3 py-1 bg-slate-900 text-white border border-slate-700 font-semibold min-w-[2.5rem] text-center">{sticker.qty || 1}</span>
                      <button onClick={() => updateStickerQty(sticker.id, 1)} className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-r hover:bg-slate-700 font-bold text-lg">+</button>
                    </div>
                    <button onClick={() => deleteSticker(sticker.id)} className="ml-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"><TrashIcon className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Posters */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><ShoppingBagIcon className="w-6 h-6 text-cyan-400" />Posters</h2>
              <div className="mb-4 flex flex-col gap-2">
                <input type="text" placeholder="Poster Name" value={newPoster.name} onChange={e => setNewPoster(s => ({ ...s, name: e.target.value }))} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700" />
                <input type="number" placeholder="Price" value={newPoster.price} onChange={e => setNewPoster(s => ({ ...s, price: e.target.value }))} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700" />
                <input type="file" accept="image/*" onChange={e => setNewPoster(s => ({ ...s, image: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : '' }))} className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700" />
                <button onClick={addPoster} className="w-full bg-electric text-white rounded px-3 py-2 font-medium hover:bg-cyan-500 flex items-center justify-center gap-2"><PlusIcon className="w-5 h-5" />Add Poster</button>
              </div>
              <ul className="divide-y divide-slate-700">
                {posters.map(poster => (
                  <li key={poster.id} className="py-2 flex items-center gap-3 text-white">
                    {poster.image && <img src={poster.image} alt="" className="w-10 h-10 object-cover rounded" />}
                    <span className="flex-1">{poster.name}</span>
                    <span>₹{poster.price}</span>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => updatePosterQty(poster.id, -1)} className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-l hover:bg-slate-700 font-bold text-lg">-</button>
                      <span className="px-3 py-1 bg-slate-900 text-white border border-slate-700 font-semibold min-w-[2.5rem] text-center">{poster.qty || 1}</span>
                      <button onClick={() => updatePosterQty(poster.id, 1)} className="px-2 py-1 bg-slate-800 text-cyan-200 rounded-r hover:bg-slate-700 font-bold text-lg">+</button>
                    </div>
                    <button onClick={() => deletePoster(poster.id)} className="ml-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"><TrashIcon className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'orders' && (
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><ShoppingBagIcon className="w-6 h-6 text-cyan-400" />Orders</h2>
            <ul className="divide-y divide-slate-700">
              {mockOrders.map(order => (
                <li key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-white">
                  <div>
                    <span className="font-bold">Order #{order.id}</span> — {order.customer}
                  </div>
                  <div className="flex gap-4 mt-2 sm:mt-0">
                    <span className="text-cyan-200">₹{order.total}</span>
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${order.status === 'Completed' ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>{order.status}</span>
                    <span className="text-xs text-slate-400">{order.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'analytics' && (
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><ChartBarIcon className="w-6 h-6 text-cyan-400" />Analytics</h2>
            <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
              <div className="flex flex-col items-center bg-slate-800 rounded-lg px-8 py-6 shadow">
                <span className="text-3xl font-bold text-electric mb-2">₹{mockOrders.reduce((sum, o) => sum + o.total, 0)}</span>
                <span className="text-cyan-200">Total Revenue</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800 rounded-lg px-8 py-6 shadow">
                <span className="text-3xl font-bold text-electric mb-2">{mockOrders.length}</span>
                <span className="text-cyan-200">Orders</span>
              </div>
            </div>
            <div className="mt-8 text-cyan-200 text-center">More analytics coming soon!</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 