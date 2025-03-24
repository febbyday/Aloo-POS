// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { ReactNode } from "react"
import { SettingsSidebar } from "./SettingsSidebar"

interface SettingsLayoutProps {
  children: ReactNode;
}

/**
 * Shared layout component for all settings pages
 * Provides consistent sidebar navigation and layout
 */
export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Settings Navigation Sidebar */}
      <SettingsSidebar />
      
      {/* Content Area without scrolling */}
      <div className="flex-1">
        <div className="w-full py-6 pl-6">
          {children}
        </div>
      </div>
    </div>
  );
}