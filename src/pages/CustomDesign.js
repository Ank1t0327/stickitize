import React from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

function CustomDesign() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Create Custom Design</h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900/80 border-2 border-electric/30 rounded-xl p-8">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <ArrowUpTrayIcon className="w-12 h-12 text-cyan-200" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Upload Your Design</h2>
                <p className="text-cyan-200">Drag and drop your files here or click to browse</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="file"
                  id="design-upload"
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="design-upload"
                  className="block w-full px-6 py-3 bg-electric text-white rounded-lg font-medium hover:bg-cyan-500 transition-colors cursor-pointer text-center"
                >
                  Choose File
                </label>
                
                <button
                  className="w-full px-6 py-3 bg-slate-800 text-cyan-200 rounded-lg font-medium hover:bg-slate-700 transition-colors"
                >
                  Create Design
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomDesign; 