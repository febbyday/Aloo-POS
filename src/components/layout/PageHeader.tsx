import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

/**
 * PageHeader component for consistent page headers across the application
 * Includes title, description, breadcrumbs and optional action buttons
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  actions,
}) => {
  return (
    <div className="flex flex-col space-y-2.5">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground">
          <ol className="flex items-center flex-wrap">
            <li className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Home className="h-3.5 w-3.5 mr-1" />
                <span className="sr-only">Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
            </li>
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index < breadcrumbs.length - 1 ? (
                  <>
                    <Link
                      to={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-1" />
                  </>
                ) : (
                  <span className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader; 