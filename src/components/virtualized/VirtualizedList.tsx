// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useRef, ReactNode, CSSProperties } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualizedListProps<T> {
  /**
   * Array of items to render in the virtualized list
   */
  items: T[]
  
  /**
   * Function to render each item
   * @param item The item to render
   * @param index The index of the item in the array
   * @returns A React node
   */
  renderItem: (item: T, index: number) => ReactNode
  
  /**
   * Height of the container in pixels or CSS value
   * @default '500px'
   */
  height?: string | number
  
  /**
   * Estimated height of each item in pixels
   * @default 60
   */
  estimatedItemHeight?: number
  
  /**
   * Optional CSS class name for the container
   */
  className?: string
  
  /**
   * Optional inline styles for the container
   */
  style?: CSSProperties
  
  /**
   * Optional CSS class name for each item
   */
  itemClassName?: string
  
  /**
   * Optional function to get a unique key for each item
   * @default (item, index) => index
   */
  getItemKey?: (item: T, index: number) => string | number
  
  /**
   * Optional overscan count (number of items to render outside of the visible area)
   * @default 5
   */
  overscan?: number
}

/**
 * A virtualized list component that efficiently renders large datasets
 * by only rendering the items that are visible in the viewport.
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  height = '500px',
  estimatedItemHeight = 60,
  className = '',
  style = {},
  itemClassName = '',
  getItemKey = (_, index) => index,
  overscan = 5,
}: VirtualizedListProps<T>) {
  // Reference to the scrollable container element
  const parentRef = useRef<HTMLDivElement>(null)
  
  // Initialize the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan,
  })
  
  // Combine provided styles with required styles
  const containerStyle: CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'auto',
    ...style,
  }
  
  return (
    <div 
      ref={parentRef}
      className={`virtualized-list-container ${className}`}
      style={containerStyle}
      data-testid="virtualized-list"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index]
          return (
            <div
              key={getItemKey(item, virtualRow.index)}
              data-index={virtualRow.index}
              className={`virtualized-list-item ${itemClassName}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default VirtualizedList
