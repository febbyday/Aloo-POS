import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  apiMonitor, 
  getApiMetrics, 
  getAverageResponseTime, 
  getErrorRate, 
  getRetrySuccessRate,
  subscribeToMetrics
} from '@/lib/monitoring/api-monitor';
import { ApiErrorType } from '@/lib/api/error-handler';

// Helper to format time
const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// Helper to format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Helper to get color based on value
const getColorForValue = (value: number, thresholds: [number, number]): string => {
  const [warning, danger] = thresholds;
  if (value >= danger) return 'bg-destructive text-destructive-foreground';
  if (value >= warning) return 'bg-warning text-warning-foreground';
  return 'bg-success text-success-foreground';
};

// Helper to get inverse color based on value (lower is better)
const getInverseColorForValue = (value: number, thresholds: [number, number]): string => {
  const [warning, danger] = thresholds;
  if (value <= warning) return 'bg-success text-success-foreground';
  if (value <= danger) return 'bg-warning text-warning-foreground';
  return 'bg-destructive text-destructive-foreground';
};

export function ApiMonitoringDashboard() {
  const [metrics, setMetrics] = useState(getApiMetrics());
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(5000);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Subscribe to metrics updates
  useEffect(() => {
    const unsubscribe = subscribeToMetrics((newMetrics) => {
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    });

    return () => unsubscribe();
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(() => {
      setMetrics(getApiMetrics());
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Calculate derived metrics
  const errorRate = getErrorRate();
  const avgResponseTime = getAverageResponseTime();
  const retrySuccessRate = getRetrySuccessRate();

  // Get top error endpoints
  const topErrorEndpoints = Object.entries(metrics.endpointMetrics)
    .map(([endpoint, data]) => ({
      endpoint,
      errorRate: data.failedRequests / data.totalRequests * 100,
      totalErrors: data.failedRequests,
      totalRequests: data.totalRequests
    }))
    .filter(item => item.totalRequests > 0)
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, 5);

  // Get top retry endpoints
  const topRetryEndpoints = Object.entries(metrics.endpointMetrics)
    .map(([endpoint, data]) => ({
      endpoint,
      retries: data.retries,
      totalRequests: data.totalRequests,
      retryRate: data.retries / data.totalRequests * 100
    }))
    .filter(item => item.retries > 0)
    .sort((a, b) => b.retries - a.retries)
    .slice(0, 5);

  // Get error distribution by type
  const errorsByType = Object.entries(metrics.errorsByType)
    .map(([type, count]) => ({
      type: type as ApiErrorType,
      count,
      percentage: metrics.failedRequests > 0 
        ? (count / metrics.failedRequests) * 100 
        : 0
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // Handle refresh
  const handleRefresh = () => {
    setMetrics(getApiMetrics());
    setLastUpdated(new Date());
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all metrics?')) {
      apiMonitor.resetMetrics();
      setLastUpdated(new Date());
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setRefreshInterval(prev => prev ? null : 5000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>API Monitoring Dashboard</CardTitle>
            <CardDescription>
              Track API errors, retries, and performance metrics
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleAutoRefresh}
            >
              {refreshInterval ? 'Disable Auto-refresh' : 'Enable Auto-refresh'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="retries">Retries</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Request Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalRequests}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Success: {metrics.successfulRequests} | Failed: {metrics.failedRequests}
                  </div>
                  <Progress 
                    value={metrics.totalRequests > 0 ? (metrics.successfulRequests / metrics.totalRequests) * 100 : 100} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>

              {/* Error Rate */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{formatPercentage(errorRate)}</div>
                    <Badge className={getColorForValue(errorRate, [5, 20])}>
                      {errorRate < 5 ? 'Healthy' : errorRate < 20 ? 'Warning' : 'Critical'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last hour: {formatPercentage(metrics.timeBasedMetrics.lastHour.requests > 0 
                      ? (metrics.timeBasedMetrics.lastHour.errors / metrics.timeBasedMetrics.lastHour.requests) * 100 
                      : 0)}
                  </div>
                  <Progress 
                    value={100 - errorRate} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{formatTime(avgResponseTime)}</div>
                    <Badge className={getInverseColorForValue(avgResponseTime, [500, 1000])}>
                      {avgResponseTime < 500 ? 'Fast' : avgResponseTime < 1000 ? 'Moderate' : 'Slow'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on {metrics.responseTimes.length} requests
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (avgResponseTime / 20))} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Retry Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Retry Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Retries:</span>
                      <span className="font-medium">{metrics.totalRetries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful Retries:</span>
                      <span className="font-medium">{metrics.successfulRetries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Retries:</span>
                      <span className="font-medium">{metrics.failedRetries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retry Success Rate:</span>
                      <span className="font-medium">{formatPercentage(retrySuccessRate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time-based Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Time-based Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Last Hour</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Requests:</span>
                          <span className="font-medium">{metrics.timeBasedMetrics.lastHour.requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Errors:</span>
                          <span className="font-medium">{metrics.timeBasedMetrics.lastHour.errors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retries:</span>
                          <span className="font-medium">{metrics.timeBasedMetrics.lastHour.retries}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Last Day</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Requests:</span>
                          <span className="font-medium">{metrics.timeBasedMetrics.lastDay.requests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Errors:</span>
                          <span className="font-medium">{metrics.timeBasedMetrics.lastDay.errors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retries:</span>
                          <span className="font-medium">{metrics.timeBasedMetrics.lastDay.retries}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Error Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {errorsByType.length > 0 ? (
                  <div className="space-y-3">
                    {errorsByType.map(({ type, count, percentage }) => (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{type}</span>
                          <span>{count} ({formatPercentage(percentage)})</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No errors recorded yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Error Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                {topErrorEndpoints.length > 0 ? (
                  <div className="space-y-4">
                    {topErrorEndpoints.map(({ endpoint, errorRate, totalErrors, totalRequests }) => (
                      <div key={endpoint} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium truncate max-w-[70%]" title={endpoint}>
                            {endpoint}
                          </span>
                          <span>
                            {totalErrors}/{totalRequests} ({formatPercentage(errorRate)})
                          </span>
                        </div>
                        <Progress 
                          value={100 - errorRate} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No endpoint errors recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retries Tab */}
          <TabsContent value="retries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Retry Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Total Retries</div>
                    <div className="text-2xl font-bold">{metrics.totalRetries}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(metrics.totalRequests > 0 
                        ? (metrics.totalRetries / metrics.totalRequests) * 100 
                        : 0)} of all requests
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Successful Retries</div>
                    <div className="text-2xl font-bold">{metrics.successfulRetries}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(retrySuccessRate)} success rate
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Failed Retries</div>
                    <div className="text-2xl font-bold">{metrics.failedRetries}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(metrics.totalRetries > 0 
                        ? (metrics.failedRetries / metrics.totalRetries) * 100 
                        : 0)} failure rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Retry Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                {topRetryEndpoints.length > 0 ? (
                  <div className="space-y-4">
                    {topRetryEndpoints.map(({ endpoint, retries, totalRequests, retryRate }) => (
                      <div key={endpoint} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium truncate max-w-[70%]" title={endpoint}>
                            {endpoint}
                          </span>
                          <span>
                            {retries} retries ({formatPercentage(retryRate)})
                          </span>
                        </div>
                        <Progress 
                          value={100 - retryRate} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No retries recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Endpoint Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(metrics.endpointMetrics).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(metrics.endpointMetrics)
                      .sort((a, b) => b[1].totalRequests - a[1].totalRequests)
                      .map(([endpoint, data]) => (
                        <div key={endpoint} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium truncate max-w-[90%]" title={endpoint}>
                                {endpoint}
                              </h4>
                              <div className="text-xs text-muted-foreground">
                                {data.totalRequests} requests | {formatTime(data.averageResponseTime)} avg response
                              </div>
                            </div>
                            <Badge className={getColorForValue(
                              data.totalRequests > 0 ? (data.failedRequests / data.totalRequests) * 100 : 0, 
                              [5, 20]
                            )}>
                              {formatPercentage(data.totalRequests > 0 
                                ? (data.failedRequests / data.totalRequests) * 100 
                                : 0)} error rate
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Success:</span>{' '}
                              <span className="font-medium">{data.totalRequests - data.failedRequests}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Errors:</span>{' '}
                              <span className="font-medium">{data.failedRequests}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Retries:</span>{' '}
                              <span className="font-medium">{data.retries}</span>
                            </div>
                          </div>
                          {data.lastError && (
                            <div className="text-xs text-destructive">
                              Last error: {data.lastError.message} ({data.lastError.type})
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No endpoint data recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Data is collected in real-time from API requests and retries.
      </CardFooter>
    </Card>
  );
}

export default ApiMonitoringDashboard;
