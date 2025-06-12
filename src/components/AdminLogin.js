import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = login(formData.adminId, formData.password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-cyan-400">
            Enter your credentials to access the dashboard
          </p>
        </div>
        <div className="mt-8 bg-slate-900/80 border-2 border-electric rounded-xl p-8 shadow-neon">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-cyan-200">
                Admin ID
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                required
                value={formData.adminId}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:border-electric focus:ring-2 focus:ring-electric/60 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cyan-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white focus:border-electric focus:ring-2 focus:ring-electric/60 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center animate-fadeInUp">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 shadow-neon-btn bg-gradient-to-r from-electric to-cyan hover:scale-105 focus:outline-none focus:ring-2 focus:ring-electric/60 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 