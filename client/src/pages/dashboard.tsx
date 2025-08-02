import React from 'react';
import DashboardSimple from './dashboard-simple';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confidence Compass
          </h1>
          <p className="text-gray-600">
            AI-powered speech practice for interviews, presentations, and public speaking
          </p>
        </div>
        
        <DashboardSimple />
      </div>
    </div>
  );
}
