import React from 'react';

const Notification = ({ notification }) => {
  if (!notification.show) return null;

  return (
    <div 
      className={`notification ${notification.type}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: notification.type === 'success' ? '#52c41a' : '#ff4d4f',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '200px'
      }}
    >
      {notification.message}
    </div>
  );
};

export default Notification;

