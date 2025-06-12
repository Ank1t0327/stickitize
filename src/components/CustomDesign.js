import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomDesign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    image: null,
    type: 'Sticker',
    quantity: 1,
    size: 'Medium',
    deliveryMethod: 'Pickup',
    deliveryLocation: '',
    paymentMethod: 'Cash on Delivery',
    mobileNumber: ''
  });
  const [preview, setPreview] = useState(null);
  const [deliveryLocations, setDeliveryLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load delivery locations from localStorage
  useEffect(() => {
    const savedLocations = localStorage.getItem('deliveryLocations');
    if (savedLocations) {
      const locations = JSON.parse(savedLocations);
      setDeliveryLocations(locations);
      if (locations.length > 0) {
        setFormData(prev => ({ ...prev, deliveryLocation: locations[0].name }));
      }
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful payment
    if (formData.paymentMethod === 'Online Payment') {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Store order in localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: Date.now(),
      ...formData,
      customDesign: true,
      status: 'Pending',
      date: new Date().toISOString()
    };
    localStorage.setItem('orders', JSON.stringify([...orders, newOrder]));

    navigate('/success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-900/80 border-2 border-electric rounded-xl p-8 shadow-neon">
          <h1 className="text-3xl font-bold text-white mb-2">Custom Design</h1>
          <p className="text-cyan-200 mb-8">Upload your vibe, we'll Stickitize it!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-4">
              <label className="block text-cyan-200 mb-2">Upload Your Design</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-cyan-700 rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-cyan-200">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-cyan-400">PNG, JPG (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    required
                  />
                </label>
              </div>
              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg border-2 border-cyan-700"
                  />
                </div>
              )}
            </div>

            {/* Design Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-cyan-200 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                >
                  <option value="Sticker">Sticker</option>
                  <option value="Poster">Poster</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-cyan-200 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-cyan-200 mb-2">
                  Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>

              <div>
                <label htmlFor="mobileNumber" className="block text-cyan-200 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                />
              </div>
            </div>

            {/* Delivery Method */}
            <div>
              <label className="block text-cyan-200 mb-2">Delivery Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Pickup"
                    checked={formData.deliveryMethod === 'Pickup'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Pickup</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="Delivery"
                    checked={formData.deliveryMethod === 'Delivery'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Delivery</span>
                </label>
              </div>
            </div>

            {/* Delivery Location */}
            {formData.deliveryMethod === 'Delivery' && (
              <div>
                <label htmlFor="deliveryLocation" className="block text-cyan-200 mb-2">
                  Delivery Location
                </label>
                <select
                  id="deliveryLocation"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                >
                  <option value="">Select a location</option>
                  {deliveryLocations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name} - {location.description}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-cyan-200 mb-2">Payment Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Cash on Delivery</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={formData.paymentMethod === 'Online Payment'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Online Payment</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomDesign; 