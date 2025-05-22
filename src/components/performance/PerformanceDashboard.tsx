import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance/performance-monitor';

/**
 * Group measurements by category
 */
function groupMeasurements(measurements: Record<string, { duration: number, timestamp: number }>) {
  const groups: Record<string, Array<[string, { duration: number, timestamp: number }]>> = {
    app: [],
    providers: [],
    lazyProviders: [],
    lazyRoutes: [],
    api: [],
    other: []
  };

  Object.entries(measurements).forEach(entry => {
    const [name] = entry;

    if (name.startsWith('app:')) {
      groups.app.push(entry);
    } else if (name.startsWith('providers:')) {
      groups.providers.push(entry);
    } else if (name.startsWith('lazyProvider:')) {
      groups.lazyProviders.push(entry);
    } else if (name.startsWith('lazyRoute:')) {
      groups.lazyRoutes.push(entry);
    } else if (name.startsWith('api:')) {
      groups.api.push(entry);
    } else {
      groups.other.push(entry);
    }
  });

  // Sort each group by duration
  Object.keys(groups).forEach(key => {
    groups[key].sort(([, a], [, b]) => b.duration - a.duration);
  });

  return groups;
}

/**
 * PerformanceDashboard Component
 *
 * This component displays performance metrics collected by the performance monitor.
 */
export function PerformanceDashboard() {
  const [measurements, setMeasurements] = useState<Record<string, { duration: number, timestamp: number }>>({});
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Update measurements every second
    const interval = setInterval(() => {
      setMeasurements(performanceMonitor.getAllMeasurements());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Group measurements by category
  const groupedMeasurements = groupMeasurements(measurements);

  // Get all measurements sorted by duration
  const sortedMeasurements = Object.entries(measurements)
    .sort(([, a], [, b]) => b.duration - a.duration);

  // Get measurements for the active tab
  const activeMeasurements = activeTab === 'all'
    ? sortedMeasurements
    : groupedMeasurements[activeTab as keyof typeof groupedMeasurements] || [];

  if (sortedMeasurements.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card shadow-lg rounded-lg p-4 max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {expanded ? (
          <>
            <div className="flex space-x-2 mb-2 overflow-x-auto">
              <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                All
              </TabButton>
              <TabButton active={activeTab === 'app'} onClick={() => setActiveTab('app')}>
                App
              </TabButton>
              <TabButton active={activeTab === 'providers'} onClick={() => setActiveTab('providers')}>
                Providers
              </TabButton>
              <TabButton active={activeTab === 'lazyProviders'} onClick={() => setActiveTab('lazyProviders')}>
                Lazy Providers
              </TabButton>
              <TabButton active={activeTab === 'lazyRoutes'} onClick={() => setActiveTab('lazyRoutes')}>
                Lazy Routes
              </TabButton>
              <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')}>
                API
              </TabButton>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-1">Measurement</th>
                    <th className="text-right py-1">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeasurements.map(([name, { duration }]) => (
                    <tr key={name} className="border-t border-border">
                      <td className="py-1">{name}</td>
                      <td className="text-right py-1">{duration.toFixed(2)}ms</td>
                    </tr>
                  ))}
                  {activeMeasurements.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={2} className="py-2 text-center text-muted-foreground">
                        No measurements in this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Total Initialization</span>
              <span className="text-sm font-medium">
                {measurements['app:initialization']?.duration.toFixed(2) || '...'}ms
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Providers</span>
              <span className="text-sm font-medium">
                {measurements['providers:initialization']?.duration.toFixed(2) || '...'}ms
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Lazy Providers</span>
              <span className="text-sm font-medium">
                {Object.entries(measurements)
                  .filter(([key]) => key.startsWith('lazyProvider:'))
                  .reduce((sum, [, { duration }]) => sum + duration, 0)
                  .toFixed(2) || '0.00'}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Rendering</span>
              <span className="text-sm font-medium">
                {measurements['app:rendering']?.duration.toFixed(2) || '...'}ms
              </span>
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-muted-foreground">
          Click "Expand" to see all metrics
        </div>
      </div>
    </div>
  );
}

/**
 * Tab button component
 */
function TabButton({
  children,
  active,
  onClick
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      {children}
    </button>
  );
}

export default PerformanceDashboard;
