import React from 'react';
import { CheckCircle } from 'lucide-react';

const Notification = ({ notification, darkMode }) => {
  if (!notification) return null;
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${darkMode ? 'bg-green-600' : 'bg-green-500'} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
        <CheckCircle className="w-5 h-5" />
        <span>{notification}</span>
      </div>
    </div>
  );
};

export default Notification;
