import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shop } from '../../../types/shops.types';

interface StatusBadgeProps {
  status: Shop['status'];
  className?: string;
}

/**
 * A reusable badge component for displaying shop status
 */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusColor = (status: Shop['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Badge 
      variant={getStatusColor(status)} 
      className={`capitalize ${className}`}
    >
      {status || 'Unknown'}
    </Badge>
  );
}
