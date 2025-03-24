import React, { useState, useEffect } from 'react';
import { eventBus, POS_EVENTS } from '../event-bus';
import { useEventSubscription } from '../hooks/useEventBus';

interface EventLogEntry {
  id: string;
  eventName: string;
  data: any;
  timestamp: Date;
}

interface EventLoggerProps {
  maxEntries?: number;
  filter?: string[];
  showTimestamp?: boolean;
  showControls?: boolean;
  className?: string;
}

/**
 * Component for displaying and monitoring events in the system
 */
export const EventLogger: React.FC<EventLoggerProps> = ({
  maxEntries = 100,
  filter,
  showTimestamp = true,
  showControls = true,
  className = '',
}) => {
  const [logEntries, setLogEntries] = useState<EventLogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [filterText, setFilterText] = useState('');
  
  // Function to add a log entry
  const addLogEntry = (eventName: string, data: any) => {
    if (paused) return;
    
    // Check if the event should be filtered out
    if (filter && !filter.includes(eventName)) return;
    
    // Add the new entry
    setLogEntries(prev => {
      const newEntry: EventLogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        eventName,
        data,
        timestamp: new Date(),
      };
      
      // Keep only the most recent entries
      const updatedEntries = [newEntry, ...prev].slice(0, maxEntries);
      return updatedEntries;
    });
  };
  
  // Subscribe to all events
  useEffect(() => {
    const subscriptions = Object.values(POS_EVENTS).map(eventName => {
      return eventBus.subscribe(eventName, (data) => {
        addLogEntry(eventName, data);
      });
    });
    
    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [paused, filter]);
  
  // Filter the log entries based on the filter text
  const filteredEntries = filterText
    ? logEntries.filter(entry => 
        entry.eventName.toLowerCase().includes(filterText.toLowerCase()) ||
        JSON.stringify(entry.data).toLowerCase().includes(filterText.toLowerCase())
      )
    : logEntries;
  
  return (
    <div className={`event-logger ${className}`}>
      {showControls && (
        <div className="event-logger-controls">
          <button 
            onClick={() => setPaused(!paused)}
            className={`event-logger-button ${paused ? 'paused' : 'running'}`}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => setLogEntries([])}
            className="event-logger-button clear"
          >
            Clear
          </button>
          <input
            type="text"
            placeholder="Filter events..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="event-logger-filter"
          />
        </div>
      )}
      
      <div className="event-logger-entries">
        {filteredEntries.length === 0 ? (
          <div className="event-logger-empty">No events logged yet</div>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="event-logger-entry">
              <div className="event-logger-entry-header">
                <span className="event-logger-entry-name">{entry.eventName}</span>
                {showTimestamp && (
                  <span className="event-logger-entry-timestamp">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <pre className="event-logger-entry-data">
                {JSON.stringify(entry.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventLogger;
