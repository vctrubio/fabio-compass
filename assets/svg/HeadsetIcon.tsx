import React from 'react';

interface HeadsetIconProps {
  className?: string;
}

export const HeadsetIcon = ({ className = "w-4 h-4" }: HeadsetIconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 10H6.75C7.44036 10 8 10.5596 8 11.25V14.75C8 15.4404 7.44036 16 6.75 16H6C4.34315 16 3 14.6569 3 13C3 11.3431 4.34315 10 6 10ZM6 10V9C6 5.68629 8.68629 3 12 3C15.3137 3 18 5.68629 18 9V10M18 10H17.25C16.5596 10 16 10.5596 16 11.25V14.75C16 15.4404 16.5596 16 17.25 16H18M18 10C19.6569 10 21 11.3431 21 13C21 14.6569 19.6569 16 18 16M18 16L17.3787 18.4851C17.1561 19.3754 16.3562 20 15.4384 20H13" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
