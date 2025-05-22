/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Password Change Page
 *
 * This page allows users to change their password with current password verification
 * and new password validation for security.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { useToast } from '@/lib/toast';
import { Icons } from '../../../components/icons';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { AlertCircle, CheckCircle2, Shield } from 'lucide-react';

// Password schema with validation rules
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangePageProps {
  embeddedMode?: boolean;
}

export function PasswordChangePage({ embeddedMode = false }: PasswordChangePageProps) {
  const { changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  // Initialize form
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      const result = await changePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword
      );

      if (result.success) {
        setSuccess(true);
        form.reset();
        toast.success("Password Updated", "Your password has been changed successfully.");
      } else {
        toast.error("Password Change Failed", result.error || "Failed to change password. Please check your current password and try again.");
      }
    } catch (error) {
      toast.error("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicators
  const hasUppercase = /[A-Z]/.test(form.watch("newPassword") || "");
  const hasLowercase = /[a-z]/.test(form.watch("newPassword") || "");
  const hasNumber = /[0-9]/.test(form.watch("newPassword") || "");
  const hasSpecialChar = /[^A-Za-z0-9]/.test(form.watch("newPassword") || "");
  const isLongEnough = (form.watch("newPassword") || "").length >= 8;

  // Calculate password strength
  const getPasswordStrength = () => {
    const password = form.watch("newPassword") || "";
    if (!password) return 0;

    let strength = 0;
    if (hasUppercase) strength += 1;
    if (hasLowercase) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecialChar) strength += 1;
    if (isLongEnough) strength += 1;

    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const renderPasswordStrengthBar = () => {
    const strength = passwordStrength;
    const segments = [
      { color: strength >= 1 ? "bg-red-500" : "bg-gray-200" },
      { color: strength >= 2 ? "bg-orange-500" : "bg-gray-200" },
      { color: strength >= 3 ? "bg-yellow-500" : "bg-gray-200" },
      { color: strength >= 4 ? "bg-green-400" : "bg-gray-200" },
      { color: strength >= 5 ? "bg-green-600" : "bg-gray-200" },
    ];

    return (
      <div className="flex gap-1 h-1.5 mt-2">
        {segments.map((segment, i) => (
          <div key={i} className={`h-full w-full rounded-sm ${segment.color} transition-colors`}></div>
        ))}
      </div>
    );
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  // Content to render
  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your password has been changed successfully.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your current password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your new password"
                  {...field}
                />
              </FormControl>
              {field.value && (
                <>
                  {renderPasswordStrengthBar()}
                  <p className="text-sm text-right mt-1">
                    Password Strength: {getPasswordStrengthLabel()}
                  </p>
                </>
              )}
              <FormDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <div className={`flex items-center gap-1 ${isLongEnough ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isLongEnough ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasUppercase ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasLowercase ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>At least one number</span>
                  </div>
                  <div className={`flex items-center gap-1 ${hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>At least one special character</span>
                  </div>
                </div>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Changing Password...
            </>
          ) : (
            <>Change Password</>
          )}
        </Button>
      </form>
    </Form>
  );

  // If embedded mode, return just the content without a container
  if (embeddedMode) {
    return content;
  }

  // Otherwise, wrap in a page container
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Change Password</h1>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Change Password</span>
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {content}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-5 text-sm text-muted-foreground">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>
                Your password is never stored in plain text.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default PasswordChangePage;
