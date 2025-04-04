import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileWarning } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <FileWarning className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter">404 - Page Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound; 