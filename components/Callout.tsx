import React from 'react';

export default function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ 
      backgroundColor: '#f6f8fa', 
      borderRadius: '4px', 
      padding: '16px', 
      marginBottom: '16px',
      borderLeft: '4px solid #0070f3' 
    }}>
      {children}
    </div>
  );
} 