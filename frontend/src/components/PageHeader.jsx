import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, showBack = true }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {showBack && (
        <Link
          to="/dashboard"
          className="text-gray-400 hover:text-white transition"
          data-testid="back-to-dashboard"
        >
          <ArrowLeft size={24} />
        </Link>
      )}
      <h1 className="text-3xl font-bold text-white">{title}</h1>
    </div>
  );
}
