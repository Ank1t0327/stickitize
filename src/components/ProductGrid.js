import React from 'react';
import { products } from '../data/products';

function ProductGrid({ searchQuery }) {
  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900/80 border-2 border-electric rounded-xl overflow-hidden shadow-neon hover:shadow-neon-btn transition-all duration-300 group"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
              <p className="text-cyan-200 text-sm mb-4">{product.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-800 text-cyan-200 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-electric font-bold">₹{product.price}</span>
                <button className="px-4 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-cyan-200 text-lg">No products found matching your search</p>
        </div>
      )}
    </div>
  );
}

export default ProductGrid; 