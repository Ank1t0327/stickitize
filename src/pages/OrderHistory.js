import React from 'react';
import { Link } from 'react-router-dom';

function OrderHistory() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Order History</h1>
        
        {/* Empty Order History State */}
        <div className="text-center py-12">
          <p className="text-cyan-200 text-lg mb-4">You haven't placed any orders yet</p>
          <Link
            to="/stickers"
            className="inline-block px-6 py-3 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory; 