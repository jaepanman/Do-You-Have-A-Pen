import React from 'react';
import { SupplyId } from '../types';

interface SupplyIconProps {
  id: SupplyId;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SupplyIcon: React.FC<SupplyIconProps> = ({ id, className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
    xl: 'w-12 h-12 text-xl',
  };

  const dim = sizeMap[size];

  switch (id) {
    case 'pencil':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" fill="#FBBF24" fillOpacity="0.4" />
          <path d="m15 5 4 4" />
          <path d="M2 22l3-1-2-2Z" fill="#F59E0B" />
        </svg>
      );
    case 'pen':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" fill="#3B82F6" fillOpacity="0.3" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" fill="#2563EB" />
        </svg>
      );
    case 'pencil_sharpener':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="14" rx="3" fill="#FB923C" fillOpacity="0.3" />
          <circle cx="12" cy="12" r="3.5" fill="#F97316" fillOpacity="0.5" />
          <path d="M10 12h4" />
          <path d="M12 10v4" />
          <line x1="8" y1="5" x2="8" y2="19" strokeDasharray="1 2" />
        </svg>
      );
    case 'marker':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 3.5l6 6-9 9H5.5v-6l9-9z" fill="#F43F5E" fillOpacity="0.3" />
          <path d="M13.5 4.5l6 6" />
          <path d="M5.5 18.5l-3.5 3.5h5l-1.5-3.5" fill="#E11D48" />
        </svg>
      );
    case 'magnet':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14V8a8 8 0 1 1 16 0v6a3 3 0 0 1-6 0V8a2 2 0 1 0-4 0v6a3 3 0 0 1-6 0Z" fill="#EF4444" fillOpacity="0.3" />
          <path d="M4 11h3" stroke="#DC2626" strokeWidth="2.5" />
          <path d="M17 11h3" stroke="#2563EB" strokeWidth="2.5" />
        </svg>
      );
    case 'glue_stick':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="7" width="10" height="14" rx="2" fill="#10B981" fillOpacity="0.3" />
          <rect x="9" y="3" width="6" height="4" rx="1" fill="#059669" />
          <line x1="7" y1="12" x2="17" y2="12" stroke="#047857" strokeWidth="1.5" />
          <circle cx="12" cy="16.5" r="1.5" fill="#047857" />
        </svg>
      );
    case 'ruler':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.3 8.7 8.7 21.3a2.12 2.12 0 0 1-3 0l-3-3a2.12 2.12 0 0 1 0-3L15.3 2.7a2.12 2.12 0 0 1 3 0l3 3a2.12 2.12 0 0 1 0 3Z" fill="#14B8A6" fillOpacity="0.3" />
          <path d="m7.5 10.5 2 2" />
          <path d="m10.5 7.5 2 2" />
          <path d="m13.5 4.5 2 2" />
          <path d="m4.5 13.5 2 2" />
        </svg>
      );
    case 'eraser':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" fill="#EC4899" fillOpacity="0.3" />
          <path d="M22 21H7" strokeWidth="2.5" />
          <path d="m5 11 9 9" />
          <path d="M9.5 6.5 18 15" stroke="#DB2777" strokeDasharray="1 1" />
        </svg>
      );
    case 'pencil_case':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="11" rx="3" fill="#A855F7" fillOpacity="0.3" />
          <path d="M3 11h18" stroke="#9333EA" strokeWidth="1.5" />
          <circle cx="8" cy="11" r="1.5" fill="#9333EA" />
          <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" fill="#0EA5E9" fillOpacity="0.25" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="#0284C7" strokeWidth="2.5" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="#0284C7" strokeWidth="2.5" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="#0284C7" strokeWidth="2" />
          <rect x="7" y="13" width="2" height="2" fill="#0284C7" />
          <rect x="11" y="13" width="2" height="2" fill="#0284C7" />
          <rect x="15" y="13" width="2" height="2" fill="#0284C7" />
        </svg>
      );
    case 'notebook':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="2" fill="#6366F1" fillOpacity="0.3" />
          <line x1="8" y1="3" x2="8" y2="21" stroke="#4F46E5" strokeWidth="2" />
          <line x1="11" y1="8" x2="17" y2="8" stroke="#4338CA" strokeWidth="1.5" />
          <line x1="11" y1="12" x2="17" y2="12" stroke="#4338CA" strokeWidth="1.5" />
          <line x1="11" y1="16" x2="15" y2="16" stroke="#4338CA" strokeWidth="1.5" />
        </svg>
      );
    case 'stapler':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`${dim} ${className}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17h16a1 1 0 0 0 1-1v-2a2 2 0 0 0-2-2H5a1 1 0 0 0-1 1v4z" fill="#8B5CF6" fillOpacity="0.3" />
          <path d="M4 14l12-7a2 2 0 0 1 2.6.8l.4.8" stroke="#7C3AED" strokeWidth="2" />
          <line x1="3" y1="19" x2="21" y2="19" stroke="#6D28D9" strokeWidth="2.5" />
        </svg>
      );
    default:
      return null;
  }
};
