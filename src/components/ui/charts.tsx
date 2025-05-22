import React from 'react';

interface ChartDataPoint {
  [key: string]: any;
}

interface ChartProps {
  data: ChartDataPoint[] | { name: string; data: ChartDataPoint[] }[];
  xField?: string;
  yField?: string;
  nameField?: string;
  valueField?: string;
  seriesField?: string;
  height?: number;
  width?: number;
  color?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

interface GroupedBarChartProps {
  data: {
    categories: string[];
    series: {
      name: string;
      values: number[];
      color: string;
    }[];
  };
  height?: number;
  width?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  title?: string;
  subtitle?: string;
  darkMode?: boolean;
}

// Grouped Bar Chart component for displaying multiple metrics side by side
export function GroupedBarChart({
  data,
  height = 300,
  width,
  showXAxis = true,
  showYAxis = true,
  title,
  subtitle,
  darkMode = false
}: GroupedBarChartProps) {
  const { categories, series } = data;
  
  // Find the maximum value across all series
  const maxValue = Math.max(...series.flatMap(s => s.values));
  
  // Calculate the width of each group and bar
  const totalGroups = categories.length;
  const barsPerGroup = series.length;
  
  return (
    <div 
      className={`relative ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} 
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%' 
      }}
      aria-label={title || "Grouped bar chart"}
      role="img"
    >
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-medium text-base">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      {/* Chart container */}
      <div className="relative h-full">
        {/* Y-axis grid lines */}
        {showYAxis && (
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
              <div 
                key={i} 
                className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${i === 0 ? 'border-0' : ''}`}
                style={{ height: '1px', bottom: `${tick * 100}%` }}
              />
            ))}
          </div>
        )}
        
        {/* Y-axis labels */}
        {showYAxis && (
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
              <div key={i} className="text-right pr-2" style={{ transform: 'translateY(-50%)' }}>
                {(maxValue * tick).toFixed(0)}
              </div>
            ))}
          </div>
        )}
        
        {/* Bars container */}
        <div className="absolute inset-y-0 right-0 left-8 flex items-end">
          <div className="w-full h-[calc(100%-20px)] flex items-end">
            {categories.map((category, categoryIndex) => (
              <div 
                key={categoryIndex} 
                className="flex-1 flex justify-center items-end gap-1"
                aria-label={category}
              >
                {series.map((serie, serieIndex) => {
                  const value = serie.values[categoryIndex] || 0;
                  const percentage = maxValue ? (value / maxValue) * 100 : 0;
                  
                  return (
                    <div 
                      key={serieIndex} 
                      className="flex flex-col items-center w-full max-w-[24px]"
                      style={{ maxWidth: `${80 / barsPerGroup}%` }}
                    >
                      <div 
                        className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                        style={{ 
                          height: `${percentage}%`,
                          backgroundColor: serie.color,
                          minHeight: value > 0 ? '4px' : '0'
                        }}
                        aria-label={`${serie.name} for ${category}: ${value}`}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* X-axis labels */}
        {showXAxis && (
          <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-muted-foreground">
            {categories.map((category, i) => (
              <div key={i} className="text-center px-1 truncate" style={{ width: `${100 / categories.length}%` }}>
                {category}
              </div>
            ))}
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute top-0 right-0 flex flex-wrap gap-4">
          {series.map((serie, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: serie.color }} 
              />
              <span className="text-xs">{serie.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Bar Chart component
export function BarChart({
  data,
  xField = 'x',
  yField = 'y',
  height = 300,
  width,
  color = '#3b82f6',
  showXAxis = true,
  showYAxis = true
}: ChartProps) {
  // This is a placeholder component that renders a mock bar chart
  // In a real application, you would use a charting library like recharts, visx, or d3
  
  const chartData = Array.isArray(data) ? data : [];
  const maxValue = Math.max(...chartData.map(item => Number(item[yField]) || 0));
  
  return (
    <div 
      className="relative" 
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%' 
      }}
      aria-label="Bar chart"
      role="img"
    >
      {/* Mock bars */}
      <div className="flex items-end justify-between h-full gap-1 relative">
        {chartData.map((item, index) => {
          const value = Number(item[yField]) || 0;
          const percentage = maxValue ? (value / maxValue) * 100 : 0;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center"
              style={{ width: `${100 / chartData.length}%` }}
            >
              <div 
                className="w-full rounded-t"
                style={{ 
                  height: `${percentage}%`,
                  backgroundColor: color,
                  minHeight: '4px'
                }}
                aria-label={`${item[xField]}: ${value}`}
              />
              {showXAxis && (
                <div className="mt-2 text-xs text-center truncate w-full text-muted-foreground">
                  {String(item[xField]).substring(0, 10)}
                  {String(item[xField]).length > 10 && '...'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Y-axis labels */}
      {showYAxis && (
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
          <div>{maxValue.toFixed(0)}</div>
          <div>{(maxValue / 2).toFixed(0)}</div>
          <div>0</div>
        </div>
      )}
    </div>
  );
}

// Simple Line Chart component
export function LineChart({
  data,
  xField = 'x',
  yField = 'y',
  seriesField,
  height = 300,
  width,
  color = '#3b82f6',
  showXAxis = true,
  showYAxis = true
}: ChartProps) {
  // This is a placeholder component that renders a mock line chart
  
  // Handle both single series and multi-series data
  const series = seriesField 
    ? (data as { name: string; data: ChartDataPoint[] }[])
    : [{ name: 'default', data: data as ChartDataPoint[], color }];
  
  // Find the max value across all series
  const allValues = series.flatMap(s => s.data.map(item => Number(item[yField]) || 0));
  const maxValue = Math.max(...allValues);
  
  // Colors for multiple series
  const seriesColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <div 
      className="relative" 
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%' 
      }}
      aria-label="Line chart"
      role="img"
    >
      {/* Chart area */}
      <div className="absolute inset-0">
        {/* X-axis grid lines */}
        {showYAxis && (
          <>
            <div className="absolute left-0 right-0 top-0 border-t border-dashed border-muted" />
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-muted" />
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-muted" />
            <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-muted" />
            <div className="absolute left-0 right-0 bottom-0 border-t border-muted" />
          </>
        )}
        
        {/* Series */}
        {series.map((s, seriesIndex) => {
          const seriesColor = s.color || seriesColors[seriesIndex % seriesColors.length];
          const points = s.data.map((item, i) => {
            const x = (i / (s.data.length - 1)) * 100;
            const y = maxValue ? 100 - ((Number(item[yField]) || 0) / maxValue) * 100 : 100;
            return `${x}% ${y}%`;
          }).join(', ');
          
          return (
            <React.Fragment key={seriesIndex}>
              {/* Line */}
              <svg className="absolute inset-0 overflow-visible" preserveAspectRatio="none">
                <polyline
                  points={points}
                  fill="none"
                  stroke={seriesColor}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              
              {/* Data points */}
              {s.data.map((item, i) => {
                const x = (i / (s.data.length - 1)) * 100;
                const y = maxValue ? 100 - ((Number(item[yField]) || 0) / maxValue) * 100 : 100;
                
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-background border-2"
                    style={{
                      left: `calc(${x}% - 4px)`,
                      top: `calc(${y}% - 4px)`,
                      borderColor: seriesColor
                    }}
                    aria-label={`${item[xField]}: ${item[yField]}`}
                  />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* X-axis labels */}
      {showXAxis && (
        <div className="absolute left-0 right-0 bottom-0 flex justify-between text-xs text-muted-foreground">
          {series[0].data.length > 0 && (
            <>
              <div>{String(series[0].data[0][xField]).substring(0, 10)}</div>
              {series[0].data.length > 2 && (
                <div>{String(series[0].data[Math.floor(series[0].data.length / 2)][xField]).substring(0, 10)}</div>
              )}
              <div>{String(series[0].data[series[0].data.length - 1][xField]).substring(0, 10)}</div>
            </>
          )}
        </div>
      )}
      
      {/* Y-axis labels */}
      {showYAxis && (
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
          <div>{maxValue.toFixed(0)}</div>
          <div>{(maxValue / 2).toFixed(0)}</div>
          <div>0</div>
        </div>
      )}
      
      {/* Legend for multiple series */}
      {seriesField && series.length > 1 && (
        <div className="absolute top-0 right-0 flex flex-wrap gap-4 p-2 bg-background/80 rounded">
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: s.color || seriesColors[i % seriesColors.length] }} 
              />
              <span className="text-xs">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Pie Chart component
export function PieChart({
  data,
  nameField = 'name',
  valueField = 'value',
  height = 300,
  width
}: ChartProps) {
  // This is a placeholder component that renders a mock pie chart
  
  const chartData = Array.isArray(data) ? data : [];
  const total = chartData.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);
  
  // Colors for pie slices
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  
  // Calculate the segments
  let currentAngle = 0;
  const segments = chartData.map((item, index) => {
    const value = Number(item[valueField]) || 0;
    const percentage = total ? (value / total) * 100 : 0;
    const angle = total ? (value / total) * 360 : 0;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');
    
    return {
      name: String(item[nameField]),
      value,
      percentage,
      pathData,
      color: colors[index % colors.length]
    };
  });
  
  return (
    <div 
      className="relative" 
      style={{ 
        height: `${height}px`, 
        width: width ? `${width}px` : '100%' 
      }}
      aria-label="Pie chart"
      role="img"
    >
      {/* Chart */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {segments.map((segment, i) => (
            <path
              key={i}
              d={segment.pathData}
              fill={segment.color}
              stroke="white"
              strokeWidth="1"
              aria-label={`${segment.name}: ${segment.percentage.toFixed(1)}%`}
            />
          ))}
          <circle cx="50" cy="50" r="20" fill="white" />
        </svg>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-x-4 gap-y-2 p-2">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: segment.color }} 
            />
            <span className="text-xs">{segment.name}: {segment.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
