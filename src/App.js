import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stickers from './pages/Stickers';
import Posters from './pages/Posters';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import CustomDesign from './pages/CustomDesign';
import AdminLogin from './pages/AdminLogin';
import TrackOrder from './pages/TrackOrder';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stickers" element={<Stickers />} />
            <Route path="/posters" element={<Posters />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/custom-design" element={<CustomDesign />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 