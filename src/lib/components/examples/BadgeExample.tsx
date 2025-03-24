/**
 * Badge Example Component
 * 
 * This component demonstrates various ways to use the Badge component.
 */

import React from 'react';
import { Badge } from '../atoms';

/**
 * Badge example component
 */
export function BadgeExample() {
  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Badge Variants</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Badge Sizes</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Rounded Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge rounded>Default</Badge>
          <Badge variant="secondary" rounded>Secondary</Badge>
          <Badge variant="outline" rounded>Outline</Badge>
          <Badge variant="destructive" rounded>Destructive</Badge>
          <Badge variant="success" rounded>Success</Badge>
          <Badge variant="warning" rounded>Warning</Badge>
          <Badge variant="info" rounded>Info</Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Usage Examples</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Product status:</span>
            <Badge variant="success">In Stock</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Order status:</span>
            <Badge variant="warning">Pending</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Payment status:</span>
            <Badge variant="destructive">Failed</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span>User role:</span>
            <Badge variant="info" rounded>Admin</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Category:</span>
            <Badge variant="secondary" size="sm">Electronics</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Notifications:</span>
            <Badge variant="destructive" size="sm" rounded>5</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BadgeExample; 