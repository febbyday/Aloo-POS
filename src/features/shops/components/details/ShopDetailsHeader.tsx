import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Activity, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from './shared/StatusBadge';
import { Shop } from '../../types/shops.types';

interface ShopDetailsHeaderProps {
  shop: Shop;
  isLoading: boolean;
  onRefresh: () => void;
  onChangeStatus: (status: Shop['status']) => void;
  onDelete: () => void;
}

/**
 * Header component for the shop details page
 */
export function ShopDetailsHeader({
  shop,
  isLoading,
  onRefresh,
  onChangeStatus,
  onDelete
}: ShopDetailsHeaderProps) {
  const navigate = useNavigate();

  // Helper function to get status button styles
  const getStatusButtonStyle = (status: Shop['status']): string => {
    switch (status) {
      case 'active':
        return 'text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950';
      case 'inactive':
        return 'text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950';
      case 'maintenance':
        return 'text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950';
      default:
        return '';
    }
  };

  return (
    <div className="flex justify-between items-center w-full border-b pb-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => navigate('/shops')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{shop.name}</h1>
          <p className="text-muted-foreground text-sm">{shop.description || 'No description provided'}</p>
        </div>
        <StatusBadge status={shop.status} />
        {isLoading && (
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={isLoading}
              className={`gap-2 ${shop.status ? getStatusButtonStyle(shop.status) : ''}`}
            >
              <Activity className="h-4 w-4" />
              Status: {shop.status ? shop.status.charAt(0).toUpperCase() + shop.status.slice(1) : 'Unknown'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-green-600 font-medium cursor-pointer"
              onClick={() => onChangeStatus('active')}
              disabled={shop.status === 'active' || !shop.status}
            >
              <CheckCircle2 className="h-4 w-4" />
              Active
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-amber-600 font-medium cursor-pointer"
              onClick={() => onChangeStatus('inactive')}
              disabled={shop.status === 'inactive' || !shop.status}
            >
              <XCircle className="h-4 w-4" />
              Inactive
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600 font-medium cursor-pointer"
              onClick={() => onChangeStatus('maintenance')}
              disabled={shop.status === 'maintenance' || !shop.status}
            >
              <AlertCircle className="h-4 w-4" />
              Maintenance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={() => navigate(`/shops/${shop.id}/edit`)}
          disabled={isLoading}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Shop
        </Button>

        <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
