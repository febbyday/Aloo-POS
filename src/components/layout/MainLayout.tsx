import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navigation from './Navigation';
import Header from './Header';
import { MarketProvider } from '@/features/markets';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main sidebar navigation */}
      <Navigation />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <Header />

        {/* Main content with scrolling */}
        <main className="flex-1 overflow-auto p-6">
          {/* Context providers */}
          <MarketProvider>
            {/* Outlet for nested routes */}
            <Outlet />
          </MarketProvider>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default MainLayout;