import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, showBack = true }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
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
      <a
        href="/admin"
        className="text-xs text-gray-500 hover:text-gray-400"
        style={{ fontSize: '11px' }}
      >
        accès admin
      </a>
    </div>
  );
}
