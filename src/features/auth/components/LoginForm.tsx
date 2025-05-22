/**
 * Login Form Component
 * 
 * A form for user authentication.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequestSchema, LoginRequest } from '../schemas/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, onError, redirectUrl }: LoginFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });
  
  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await login(data);
      
      if (result.success) {
        onSuccess?.();
        
        // Redirect if URL is provided
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      } else {
        setError(result.error || 'Login failed');
        onError?.(result.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {/* Username field */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full p-2 border border-input rounded-md"
            disabled={isLoading}
            {...register('username')}
          />
          {errors.username && (
            <p className="text-destructive text-xs">{errors.username.message}</p>
          )}
        </div>
        
        {/* Password field */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full p-2 border border-input rounded-md"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>
        
        {/* Remember me checkbox */}
        <div className="flex items-center space-x-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 border border-input rounded"
            disabled={isLoading}
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe" className="text-sm">
            Remember me
          </label>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Log in'
          )}
        </button>
        
        {/* Forgot password link */}
        <div className="text-center">
          <a href="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
