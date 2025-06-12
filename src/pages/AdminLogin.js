import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        if (formData.adminId === 'admin' && formData.password === 'admin123') {
          navigate('/admin-dashboard');
        } else {
          setError('Invalid credentials');
        }
      }, 1000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="w-8 h-8 text-cyan-200" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-cyan-200 mb-2">
                Admin ID
              </label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                value={formData.adminId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-electric"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-200 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-electric"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-3 bg-electric text-white rounded-lg font-medium transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cyan-500'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 