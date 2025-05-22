import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SettingsPageSkeletonProps {
  title?: boolean;
  sections?: number;
  controls?: number;
}

/**
 * Skeleton loader for settings pages
 * Displays a placeholder UI while settings are loading
 */
export function SettingsPageSkeleton({
  title = true,
  sections = 2,
  controls = 3
}: SettingsPageSkeletonProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title skeleton */}
      {title && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-[280px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
      )}

      {/* Section skeletons */}
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-5 w-[200px]" />
          
          {/* Controls skeletons */}
          <div className="space-y-4 mt-4">
            {Array.from({ length: controls }).map((_, j) => (
              <div key={j} className="flex items-center">
                <Skeleton className="h-5 w-[150px] mr-auto" />
                <Skeleton className="h-9 w-[200px]" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action buttons */}
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
}
