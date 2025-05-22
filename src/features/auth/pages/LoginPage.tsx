/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Login Page Component
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoginRequestSchema, LoginRequest } from '../schemas/auth.schemas';

// Placeholder for Logo component if you have one
const LogoPlaceholder = () => (
  <div className="h-12 w-auto text-primary font-bold text-2xl flex items-center justify-center">
    [Your Logo Here]
  </div>
);

/**
 * Login page component for user authentication
 */
export function LoginPage() {
  const { isAuthenticated, login, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return path from the location state, or default to dashboard
  const from = (location.state as any)?.from || '/dashboard';

  // Form setup with zod validation
  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    let mounted = true;

    // Check if we're trying to access a special route from URL params
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl');
    const isSpecialRoute = returnUrl && (
      returnUrl.includes('/roles') ||
      returnUrl.includes('/permissions')
    );

    // If returning to a special route, set the flag to prevent dashboard redirect
    if (isSpecialRoute) {
      sessionStorage.setItem('prevent_dashboard_redirect', 'true');
    }

    // Only redirect if component is still mounted, authentication state is known,
    // and not during initial loading
    if (mounted && isAuthenticated && !isLoading) {
      // Use a small delay to prevent rapid state changes
      const redirectTimeout = setTimeout(() => {
        if (mounted) {
          // If we have a return URL in the query params, use that instead of the state
          if (returnUrl) {
            navigate(decodeURIComponent(returnUrl), { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        }
      }, 100);

      return () => {
        mounted = false;
        clearTimeout(redirectTimeout);
      };
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, navigate, from, isLoading, location.search]);

  // Handle form submission
  const onSubmit = async (values: LoginRequest) => {
    try {
      const result = await login(values);

      if (result.success) {
        // Store username for quick login
        localStorage.setItem('last_username', values.username);

        // Navigation will happen automatically via the useEffect
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error("Login submission error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-gradient-to-br from-green-300 via-emerald-500 to-teal-700">
      {/* Left Column: Branding/Illustration (Visible on Large Screens) */}
      <div className="hidden lg:flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* You can replace this with an illustration or a more elaborate branding element */}
          <h1 className="text-4xl font-bold mb-4 text-white">Welcome Back!</h1>
          <p className="text-white/90">
            Manage your sales, inventory, and customers efficiently with our Point of Sale system.
          </p>
          {/* Optional: Add an SVG illustration or image here */}
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-0 lg:shadow-lg bg-card text-card-foreground">
          <CardHeader className="text-center space-y-4">
            {/* Logo Placeholder */}
            <LogoPlaceholder />
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={isLoading}
                          autoComplete="username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          disabled={isLoading}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 mt-1"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Remember me</FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full !mt-6" // Added !mt-6 for emphasis
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex-col items-center justify-center text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Need help? Contact your system administrator.
            </p>
            {/* Optional: Add Forgot Password link here */}
            {/* <Button variant="link" size="sm" className="mt-2">Forgot Password?</Button> */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
