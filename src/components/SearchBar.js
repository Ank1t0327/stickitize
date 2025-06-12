import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { popularTags } from '../data/products';

function SearchBar({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState([]);
  const searchRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tags based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = popularTags.filter(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    onSearch(tag);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  return (
    <div className="sticky top-16 z-40 bg-slate-900/80 backdrop-blur-md border-b border-cyan-900/50 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search stickers and posters..."
              className="w-full px-4 py-3 pl-12 bg-slate-800 border-2 border-cyan-700 rounded-xl text-white placeholder-cyan-700 focus:outline-none focus:border-electric transition-all duration-300 shadow-neon-sm focus:shadow-neon"
            />
            <MagnifyingGlassIcon className="h-6 w-6 text-cyan-700 absolute left-4 top-1/2 transform -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-700 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Tag Suggestions */}
          {showSuggestions && (searchQuery || filteredTags.length > 0) && (
            <div className="absolute w-full mt-2 bg-slate-800 border-2 border-cyan-700 rounded-xl shadow-neon overflow-hidden">
              {filteredTags.length > 0 ? (
                <div className="p-2">
                  <p className="text-cyan-200 text-sm mb-2 px-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 bg-slate-700 text-cyan-200 rounded-full text-sm hover:bg-cyan-700 hover:text-white transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchQuery ? (
                <div className="p-4 text-cyan-200 text-center">
                  No matching tags found
                </div>
              ) : null}
            </div>
          )}

          {/* Popular Tags */}
          {!searchQuery && showSuggestions && (
            <div className="absolute w-full mt-2 bg-slate-800 border-2 border-cyan-700 rounded-xl shadow-neon p-4">
              <p className="text-cyan-200 text-sm mb-2">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1 bg-slate-700 text-cyan-200 rounded-full text-sm hover:bg-cyan-700 hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchBar; 