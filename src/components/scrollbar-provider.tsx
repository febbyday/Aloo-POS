// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { useLayoutEffect, useState, useRef } from "react";
import { useTheme } from "./theme-provider";

interface ScrollbarProviderProps {
  children: React.ReactNode;
}

/**
 * ScrollbarProvider
 * 
 * This component applies custom scrollbar styling to the application based on the current theme.
 * It ensures that scrollbars have appropriate styling in both light and dark modes.
 */
export function ScrollbarProvider({ children }: ScrollbarProviderProps) {
  const { theme } = useTheme();
  const [isStyleApplied, setIsStyleApplied] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  
  // Use useLayoutEffect for DOM mutations to run synchronously before browser paint
  useLayoutEffect(() => {
    try {
      // Apply scrollbar class to existing elements
      const mainElements = document.querySelectorAll('main, [role="dialog"], .overflow-auto, .overflow-y-auto');
      
      mainElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.classList.add('scrollbar-thin');
        }
      });
      
      // Apply to document for global scrollbar styling
      document.documentElement.classList.add('scrollbar-thin');
      
      // Set up mutation observer to handle dynamically added elements
      observerRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                // Check if the element is a scrollable container
                if (
                  node.tagName === 'MAIN' || 
                  node.getAttribute('role') === 'dialog' ||
                  node.classList.contains('overflow-auto') ||
                  node.classList.contains('overflow-y-auto')
                ) {
                  node.classList.add('scrollbar-thin');
                }
                
                // Also check descendants of added nodes
                const scrollableDescendants = node.querySelectorAll('main, [role="dialog"], .overflow-auto, .overflow-y-auto');
                scrollableDescendants.forEach(element => {
                  if (element instanceof HTMLElement) {
                    element.classList.add('scrollbar-thin');
                  }
                });
              }
            });
          }
        });
      });
      
      // Start observing with a more specific target and options
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setIsStyleApplied(true);
    } catch (error) {
      console.error('Error applying scrollbar styles:', error);
      setIsStyleApplied(false);
    }
    
    return () => {
      try {
        // Disconnect observer on cleanup
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        
        // Only attempt cleanup if styles were successfully applied
        if (isStyleApplied) {
          const mainElements = document.querySelectorAll('main, [role="dialog"], .overflow-auto, .overflow-y-auto');
          mainElements.forEach(element => {
            if (element instanceof HTMLElement) {
              element.classList.remove('scrollbar-thin');
            }
          });
          document.documentElement.classList.remove('scrollbar-thin');
        }
      } catch (error) {
        console.error('Error cleaning up scrollbar styles:', error);
      }
    };
  }, [theme]); // Re-run when theme changes
  
  return <>{children}</>;
}

export default ScrollbarProvider;
