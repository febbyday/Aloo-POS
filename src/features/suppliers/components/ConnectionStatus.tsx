import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  CloudOff, 
  AlertTriangle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ConnectionStatus as ConnStatus } from '../types';

interface ConnectionStatusProps {
  status: ConnStatus;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function ConnectionStatus({ 
  status, 
  onRefresh,
  isRefreshing 
}: ConnectionStatusProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <CloudOff className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (status.status) {
      case 'connected':
        return <Badge className="bg-green-500">Connected</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const getHealthColor = () => {
    if (!status.health) return 'bg-gray-200';
    if (status.health >= 80) return 'bg-green-500';
    if (status.health >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Connection Status</h3>
              {getStatusLabel()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {status.message || 'Connection status unavailable'}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              Refreshing
              <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Refresh Status
              <RefreshCw className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-2">Last Check</h4>
            {status.lastChecked ? (
              <p className="text-2xl font-bold">
                {new Date(status.lastChecked).toLocaleTimeString()}
              </p>
            ) : (
              <Skeleton className="h-8 w-32" />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {status.lastChecked 
                ? new Date(status.lastChecked).toLocaleDateString() 
                : 'Never checked'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-2">Latency</h4>
            {status.latency ? (
              <p className="text-2xl font-bold">{status.latency}</p>
            ) : (
              <Skeleton className="h-8 w-32" />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {status.latency 
                ? 'Response time to supplier API' 
                : 'Not available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium">Health</h4>
              <span className="text-sm font-medium">
                {status.health !== null ? `${status.health}%` : '--'}
              </span>
            </div>
            <Progress 
              value={status.health || 0} 
              className={getHealthColor()}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {getHealthDescription(status.health)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Connection Details</h4>
        <div className="bg-muted rounded-md p-4">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify({
              status: status.status,
              message: status.message,
              lastChecked: status.lastChecked,
              latency: status.latency,
              health: status.health,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function getHealthDescription(health: number | null): string {
  if (health === null) return 'Health metrics not available';
  if (health >= 90) return 'Excellent: Connection is working optimally';
  if (health >= 80) return 'Good: Connection is stable';
  if (health >= 60) return 'Fair: Connection has minor issues';
  if (health >= 40) return 'Poor: Connection has significant issues';
  return 'Critical: Connection is severely degraded';
} 