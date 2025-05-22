import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Coffee,
  Loader2,
  Undo,
  HelpCircle,
  BarChart,
  Palette,
  ArrowUpDown,
  LayoutGrid
} from 'lucide-react';

/**
 * Component that demonstrates the standardized toast system
 */
export function ToastExamples() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('basic');

  // Example product
  const product = {
    id: 'prod123',
    name: 'Iced Latte',
    price: 4.99,
    options: {
      sizes: ['Small', 'Medium', 'Large'],
      iceOptions: ['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice']
    }
  };

  // Basic toast examples
  const showBasicToasts = () => {
    toast.success('Operation completed successfully');

    setTimeout(() => {
      toast.error('An error occurred');
    }, 1000);

    setTimeout(() => {
      toast.warning('Please check your input');
    }, 2000);

    setTimeout(() => {
      toast.info('New updates available');
    }, 3000);

    setTimeout(() => {
      toast.default('This is a default toast');
    }, 4000);
  };

  // Toast with title and description
  const showDetailedToasts = () => {
    toast.success({
      title: 'Success',
      description: 'Your changes have been saved successfully.'
    });

    setTimeout(() => {
      toast.error({
        title: 'Error',
        description: 'Failed to save changes. Please try again.'
      });
    }, 1000);

    setTimeout(() => {
      toast.warning({
        title: 'Warning',
        description: 'Your session will expire in 5 minutes.'
      });
    }, 2000);

    setTimeout(() => {
      toast.info({
        title: 'Information',
        description: 'New version available. Please update your application.'
      });
    }, 3000);
  };

  // Toast with actions
  const showActionToasts = () => {
    toast.action(
      'Item Deleted',
      'The item has been removed from your cart',
      () => console.log('Undo action'),
      'Undo'
    );

    setTimeout(() => {
      toast.info({
        title: 'New Feature Available',
        description: 'Try our new reporting dashboard',
        action: {
          label: 'View',
          onClick: () => console.log('View action')
        }
      });
    }, 1500);
  };

  // Toast with custom content
  const showCustomToasts = () => {
    toast.success({
      title: 'Product Added',
      description: (
        <div className="space-y-1">
          <p><strong>{product.name}</strong> - ${product.price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Added to cart</p>
        </div>
      )
    });
  };

  // Promise toast
  const showPromiseToast = async () => {
    try {
      await toast.promise(
        // Simulate an API call
        new Promise((resolve, reject) => {
          setTimeout(() => {
            // 80% chance of success
            if (Math.random() > 0.2) {
              resolve({ success: true });
            } else {
              reject(new Error('Network error'));
            }
          }, 2000);
        }),
        {
          loading: 'Processing your request...',
          success: 'Request completed successfully',
          error: 'Failed to process request'
        }
      );
    } catch (error) {
      console.error('Promise rejected:', error);
    }
  };

  // Loading toast
  const showLoadingToast = () => {
    const { id } = toast.loading('Loading data...');

    // Simulate a delay
    setTimeout(() => {
      // Update the toast to success
      toast.success({
        id,
        title: 'Data Loaded',
        description: 'Your data has been loaded successfully'
      });
    }, 2000);
  };

  // Example of a progress toast with updating progress
  const showProgressToast = () => {
    // Create a progress toast
    const { id } = toast.progress("Uploading File", 0, "Starting upload...");

    // Update progress every 500ms
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;

      if (progress <= 100) {
        // Update the progress toast
        toast.updateProgress(id, progress, {
          description: `Uploading file... ${progress}%`
        });
      } else {
        // Complete the progress toast
        toast.success({
          id,
          title: "Upload Complete",
          description: "Your file has been uploaded successfully"
        });
        clearInterval(interval);
      }
    }, 500);
  };

  // Example of a confirmation toast
  const showConfirmationToast = () => {
    toast.confirmation(
      "Delete Item?",
      "Are you sure you want to delete this item? This action cannot be undone.",
      () => {
        toast.success("Item Deleted", "The item has been deleted successfully");
      },
      () => {
        toast.info("Cancelled", "The delete operation was cancelled");
      },
      "Delete",
      "Cancel"
    );
  };

  // Example of a custom toast
  const showCustomToast = () => {
    toast.custom({
      title: "Custom Toast",
      description: "This is a fully customized toast notification",
      icon: <Palette className="h-5 w-5 text-indigo-500" />,
      className: "bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white",
      duration: 5000,
    });
  };

  // Example of toast with different positions
  const showPositionedToasts = () => {
    toast.info({
      title: "Top Left",
      description: "This toast appears in the top left",
      position: "top-left",
      duration: 3000,
    });

    setTimeout(() => {
      toast.info({
        title: "Top Center",
        description: "This toast appears in the top center",
        position: "top-center",
        duration: 3000,
      });
    }, 500);

    setTimeout(() => {
      toast.info({
        title: "Top Right",
        description: "This toast appears in the top right",
        position: "top-right",
        duration: 3000,
      });
    }, 1000);

    setTimeout(() => {
      toast.info({
        title: "Bottom Left",
        description: "This toast appears in the bottom left",
        position: "bottom-left",
        duration: 3000,
      });
    }, 1500);

    setTimeout(() => {
      toast.info({
        title: "Bottom Center",
        description: "This toast appears in the bottom center",
        position: "bottom-center",
        duration: 3000,
      });
    }, 2000);
  };

  // Example of toast with different animations
  const showAnimatedToasts = () => {
    toast.info({
      title: "Slide Animation",
      description: "This toast uses slide animation",
      animation: "slide",
      duration: 3000,
    });

    setTimeout(() => {
      toast.info({
        title: "Fade Animation",
        description: "This toast uses fade animation",
        animation: "fade",
        duration: 3000,
      });
    }, 500);

    setTimeout(() => {
      toast.info({
        title: "Zoom Animation",
        description: "This toast uses zoom animation",
        animation: "zoom",
        duration: 3000,
      });
    }, 1000);

    setTimeout(() => {
      toast.info({
        title: "Bounce Animation",
        description: "This toast uses bounce animation",
        animation: "bounce",
        duration: 3000,
      });
    }, 1500);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-primary" />
          Enhanced Toast Examples
        </CardTitle>
        <CardDescription>
          Examples of the standardized toast notification system with extended features
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
            <TabsTrigger value="extended">Extended</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basic">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Basic Toast Types
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Shows all basic toast types with simple messages
                </p>
                <Button onClick={showBasicToasts} className="w-full">
                  Show Basic Toasts
                </Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  Detailed Toasts
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toasts with both title and description
                </p>
                <Button onClick={showDetailedToasts} className="w-full">
                  Show Detailed Toasts
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="advanced">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Undo className="h-4 w-4 mr-2 text-purple-500" />
                  Action Toasts
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toasts with action buttons
                </p>
                <Button onClick={showActionToasts} className="w-full">
                  Show Action Toasts
                </Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Coffee className="h-4 w-4 mr-2 text-amber-500" />
                  Custom Content
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toasts with custom JSX content
                </p>
                <Button onClick={showCustomToasts} className="w-full">
                  Show Custom Toasts
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="special">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 text-blue-500 animate-spin" />
                  Promise Toast
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toast that changes based on promise result
                </p>
                <Button onClick={showPromiseToast} className="w-full">
                  Show Promise Toast
                </Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Loading Toast
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toast that updates after loading
                </p>
                <Button onClick={showLoadingToast} className="w-full">
                  Show Loading Toast
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="extended">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-purple-500" />
                  Confirmation Toast
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toast with confirmation buttons
                </p>
                <Button onClick={showConfirmationToast} className="w-full">
                  Show Confirmation Toast
                </Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                  Progress Toast
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toast with progress indicator
                </p>
                <Button onClick={showProgressToast} className="w-full">
                  Show Progress Toast
                </Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Palette className="h-4 w-4 mr-2 text-indigo-500" />
                  Custom Toast
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toast with custom styling
                </p>
                <Button onClick={showCustomToast} className="w-full">
                  Show Custom Toast
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="customization">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2 text-blue-500" />
                  Positioned Toasts
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toasts in different screen positions
                </p>
                <Button onClick={showPositionedToasts} className="w-full">
                  Show Positioned Toasts
                </Button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-green-500" />
                  Animated Toasts
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Toasts with different animations
                </p>
                <Button onClick={showAnimatedToasts} className="w-full">
                  Show Animated Toasts
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex flex-col gap-3 px-6 py-4">
        <p className="text-sm text-muted-foreground">
          These examples demonstrate the standardized toast notification system.
          Use the <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">useToast()</code> hook
          to access the toast functions in your components.
        </p>
      </CardFooter>
    </Card>
  );
}

export default ToastExamples;
