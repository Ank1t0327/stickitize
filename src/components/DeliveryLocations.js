import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Mock initial delivery locations
const initialLocations = [
  { id: 1, name: 'Hostel A', description: 'Main hostel building' },
  { id: 2, name: 'Hostel B', description: 'New hostel block' },
  { id: 3, name: 'Main Gate', description: 'College main entrance' }
];

function DeliveryLocations() {
  const [locations, setLocations] = useState(() => {
    const savedLocations = localStorage.getItem('deliveryLocations');
    return savedLocations ? JSON.parse(savedLocations) : initialLocations;
  });
  const [newLocation, setNewLocation] = useState({ name: '', description: '' });
  const [editingLocation, setEditingLocation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deliveryLocations', JSON.stringify(locations));
  }, [locations]);

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocation.name.trim()) return;

    const location = {
      id: Date.now(),
      name: newLocation.name.trim(),
      description: newLocation.description.trim()
    };

    setLocations([...locations, location]);
    setNewLocation({ name: '', description: '' });
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingLocation.name.trim()) return;

    setLocations(locations.map(loc =>
      loc.id === editingLocation.id ? editingLocation : loc
    ));
    setEditingLocation(null);
  };

  const handleDeleteLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
    setShowDeleteConfirm(null);
  };

  return (
    <div className="bg-slate-900/80 border-2 border-electric rounded-xl p-6 shadow-neon">
      <h2 className="text-2xl font-bold text-white mb-6">Delivery Locations</h2>

      {/* Add New Location Form */}
      <form onSubmit={handleAddLocation} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="locationName" className="block text-cyan-200 mb-2">
              Location Name
            </label>
            <input
              type="text"
              id="locationName"
              value={newLocation.name}
              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
              placeholder="e.g., Hostel C"
              className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
            />
          </div>
          <div>
            <label htmlFor="locationDescription" className="block text-cyan-200 mb-2">
              Description
            </label>
            <input
              type="text"
              id="locationDescription"
              value={newLocation.description}
              onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
              placeholder="e.g., New hostel block near library"
              className="w-full px-4 py-2 bg-slate-800 border-2 border-cyan-700 rounded-lg text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Location
        </button>
      </form>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-slate-800/60 border-2 border-cyan-700 rounded-lg p-4 hover:border-electric transition-colors"
          >
            {editingLocation?.id === location.id ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-200 mb-2">Name</label>
                    <input
                      type="text"
                      value={editingLocation.name}
                      onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-200 mb-2">Description</label>
                    <input
                      type="text"
                      value={editingLocation.description}
                      onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border-2 border-cyan-700 rounded-lg text-white focus:outline-none focus:border-electric transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingLocation(null)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">{location.name}</h3>
                  <p className="text-cyan-200 text-sm">{location.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLocation(location)}
                    className="p-2 text-cyan-400 hover:text-white hover:shadow-neon-btn transition-all duration-200 rounded-lg border border-transparent hover:border-cyan-400"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(location.id)}
                    className="p-2 text-cyan-400 hover:text-white hover:shadow-neon-btn transition-all duration-200 rounded-lg border border-transparent hover:border-cyan-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border-2 border-electric rounded-xl p-6 max-w-md w-full mx-4 shadow-neon">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-cyan-200 mb-6">
              Are you sure you want to delete this delivery location? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 px-4 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLocation(showDeleteConfirm)}
                className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 border-2 border-red-500/50 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryLocations; 