import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import DashboardSimple from './dashboard-simple';

export default function Practice() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Parse category from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Practice Session
          </h1>
          <p className="text-gray-600">
            {selectedCategory 
              ? `Practicing ${selectedCategory.replace('-', ' ')} skills`
              : 'Select a category and question to start practicing your speaking skills'
            }
          </p>
        </div>

        <DashboardSimple initialCategory={selectedCategory} />
      </div>
    </div>
  );
} 