/**
 * Development Mode Indicator
 * 
 * A simple component that displays a visual indicator when the application
 * is running in development mode with authentication bypass enabled.
 */

import React from 'react';

export function DevelopmentModeIndicator() {
  // Only show in development mode
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  // Styles for the indicator
  const styles = {
    container: {
      position: 'fixed' as const,
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(255, 0, 0, 0.7)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      AUTH BYPASS ENABLED
    </div>
  );
}
