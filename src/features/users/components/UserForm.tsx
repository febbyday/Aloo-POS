/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * User Form Component
 *
 * This component provides a form for creating and editing users.
 * It includes proper autocomplete attributes for better browser autofill.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Upload, Lock, UnlockKeyhole, Key, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CreateUserSchema, UpdateUserSchema, User } from '../types/user.types';
import { UserRole } from '@/features/auth/schemas/auth.schemas';
import { shouldEnablePinForRole } from '@/features/auth/utils/pinUtils';
import { validateUser } from '@/features/auth/utils/user-validation';

// Form schema for creating a user
const createUserFormSchema = CreateUserSchema.extend({
  confirmPassword: z.string()
    .min(8, "Confirm password must be at least 8 characters")
    .max(100, "Confirm password cannot exceed 100 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Form schema for updating a user
const updateUserFormSchema = UpdateUserSchema.extend({
  confirmPassword: z.string()
    .min(8, "Confirm password must be at least 8 characters")
    .max(100, "Confirm password cannot exceed 100 characters")
    .optional()
}).refine((data) => !data.password || data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Props for the UserForm component
interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onResetPin?: (userId: string) => Promise<boolean>;
}

/**
 * User Form Component
 */
export function UserForm({ user, onSubmit, onCancel, isSubmitting = false, onResetPin }: UserFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isResetPinDialogOpen, setIsResetPinDialogOpen] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Determine if we're in edit mode
  const isEditMode = !!user;

  // Use the appropriate schema based on mode
  const formSchema = isEditMode ? updateUserFormSchema : createUserFormSchema;

  // Use the shared utility function to check if the role should have PIN enabled

  // Initialize the form first, before accessing it
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      role: user?.role || UserRole.CASHIER,
      password: '',
      confirmPassword: '',
      isActive: true, // Always active by default
      // PIN is now handled automatically based on role
      isPinEnabled: user?.isPinEnabled !== undefined ? user.isPinEnabled : false,
      avatar: user?.avatar || ''
    },
    mode: 'onBlur', // Validate fields when they lose focus
  });

  // Now we can safely get the current role from form after it's initialized
  const currentRole = form.watch('role');
  const isStaff = shouldEnablePinForRole(currentRole);

  // Set PIN authentication automatically based on role
  useEffect(() => {
    const role = form.watch('role');
    // For new users, automatically set isPinEnabled based on role
    if (!isEditMode) {
      form.setValue('isPinEnabled', shouldEnablePinForRole(role));
    }
  }, [form.watch('role'), isEditMode, form]);

  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setFormError(null);

      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...userData } = data;

      // If password is empty in edit mode, remove it
      if (isEditMode && !userData.password) {
        delete userData.password;
      }

      // Always set isActive to true for new users
      if (!isEditMode) {
        userData.isActive = true;

        // Automatically set isPinEnabled based on role for new users
        userData.isPinEnabled = shouldEnablePinForRole(userData.role);
      }

      // For edit mode, merge with existing user data to ensure all required fields
      const finalUserData = isEditMode && user
        ? { ...user, ...userData }
        : userData;

      // Validate the user data against our schema
      if (isEditMode) {
        const validation = validateUser(finalUserData);
        if (!validation.success) {
          console.error('User validation failed:', validation.formattedErrors);
          setFormError('Invalid user data. Please check the form for errors.');
          return;
        }
      }

      onSubmit(finalUserData);
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle avatar upload with validation
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
      form.setValue('avatar', result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Form Error Message */}
          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-2">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="User avatar" />
              ) : null}
              <AvatarFallback className="text-xl">
                {form.watch('firstName')?.charAt(0)?.toUpperCase() || ''}
                {form.watch('lastName')?.charAt(0)?.toUpperCase() || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center mt-2">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                  <Upload className="h-4 w-4" />
                  <span>Upload Avatar</span>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <FormDescription className="text-xs text-center mt-2">
              JPEG, PNG or GIF. Max 2MB.
            </FormDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      {...field}
                      autoComplete="given-name"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      autoComplete="family-name"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      autoComplete="username"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription>
                    Letters, numbers, dots, underscores, and hyphens only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      type="email"
                      {...field}
                      autoComplete="email"
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // PIN is now set automatically based on role
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger aria-required="true">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isStaff && !isEditMode ?
                      "Staff roles will automatically have PIN authentication enabled." : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status - Hidden but always set to true for new users */}
            {isEditMode && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can log in and access the system
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                    {!isEditMode && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete={isEditMode ? "new-password" : "new-password"}
                      aria-required={!isEditMode}
                    />
                  </FormControl>
                  <FormDescription>
                    Must contain at least 8 characters, including uppercase, lowercase,
                    number, and special character (e.g., !@#$%^&*).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password
                    {!isEditMode && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      autoComplete="new-password"
                      aria-required={!isEditMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8">
            {isEditMode && onResetPin && isStaff && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetPinDialogOpen(true)}
                className="mr-auto"
              >
                <Key className="mr-2 h-4 w-4" />
                Reset PIN
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditMode ? 'Update User' : 'Create User'}</>
              )}
            </Button>
          </div>

          {/* Form Summary for Accessibility */}
          <div className="sr-only" aria-live="polite">
            {form.formState.isSubmitting ? 'Submitting form...' : ''}
            {form.formState.isSubmitSuccessful ? 'Form submitted successfully!' : ''}
            {Object.entries(form.formState.errors).length > 0
              ? `Form has ${Object.entries(form.formState.errors).length} errors`
              : ''}
          </div>
        </form>
      </Form>

      {/* Reset PIN Dialog */}
      <Dialog open={isResetPinDialogOpen} onOpenChange={setIsResetPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User PIN</DialogTitle>
            <DialogDescription>
              This will reset the user's PIN. They will need to set up a new PIN on their next login.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            {isEditMode && user?.isPinEnabled ? (
              <div className="flex items-center">
                <Lock className="h-12 w-12 text-destructive mr-4" />
                <div>
                  <p className="font-semibold">Reset PIN for {user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">Last changed: {user.lastPinChange ? new Date(user.lastPinChange).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <UnlockKeyhole className="h-12 w-12 text-muted-foreground mr-4" />
                <p>PIN is not currently enabled for this user.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetPinDialogOpen(false)}
              disabled={isResettingPin}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!user?.id || !onResetPin) return;

                setIsResettingPin(true);
                try {
                  const success = await onResetPin(user.id);
                  if (success) {
                    toast({
                      title: "PIN Reset",
                      description: `PIN has been reset for ${user.firstName} ${user.lastName}`,
                    });
                    setIsResetPinDialogOpen(false);
                  } else {
                    throw new Error('Failed to reset PIN');
                  }
                } catch (error) {
                  console.error('Error resetting PIN:', error);
                  toast({
                    title: "Error",
                    description: "Failed to reset PIN. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsResettingPin(false);
                }
              }}
              disabled={isResettingPin || !user?.isPinEnabled}
            >
              {isResettingPin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset PIN'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
