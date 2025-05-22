/**
 * Permission Converter Component
 * 
 * Example component that demonstrates how to use the permission conversion utilities.
 * This component can be used to convert permissions between different formats.
 */

import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/shared/hooks/usePermissionConverter';
import { Permissions, getDefaultPermissions } from '@/shared/schemas/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';

interface PermissionConverterProps {
  initialPermissions?: any;
  onConvert?: (permissions: Permissions, permissionsArray: string[]) => void;
}

export function PermissionConverter({ 
  initialPermissions = getDefaultPermissions(),
  onConvert
}: PermissionConverterProps) {
  // Use the permissions hook to work with the permissions
  const { permissions, permissionsArray, convertAny } = usePermissions(initialPermissions);
  
  // State for the input text areas
  const [objectInput, setObjectInput] = useState('');
  const [arrayInput, setArrayInput] = useState('');
  
  // Update the input text areas when permissions change
  useEffect(() => {
    try {
      setObjectInput(JSON.stringify(permissions, null, 2));
    } catch (error) {
      console.error('Error stringifying permissions:', error);
    }
  }, [permissions]);
  
  useEffect(() => {
    try {
      setArrayInput(JSON.stringify(permissionsArray, null, 2));
    } catch (error) {
      console.error('Error stringifying permissions array:', error);
    }
  }, [permissionsArray]);
  
  // Handle converting from object input
  const handleConvertFromObject = () => {
    try {
      const parsedObject = JSON.parse(objectInput);
      const convertedPermissions = convertAny(parsedObject);
      
      // Notify the parent component if needed
      if (onConvert) {
        onConvert(convertedPermissions, permissionsArray);
      }
      
      toast.success('Conversion Successful', 'Permissions converted from object format');
    } catch (error) {
      console.error('Error converting from object:', error);
      toast.error('Conversion Error', 'Failed to convert permissions from object format');
    }
  };
  
  // Handle converting from array input
  const handleConvertFromArray = () => {
    try {
      const parsedArray = JSON.parse(arrayInput);
      const convertedPermissions = convertAny(parsedArray);
      
      // Notify the parent component if needed
      if (onConvert) {
        onConvert(convertedPermissions, permissionsArray);
      }
      
      toast.success('Conversion Successful', 'Permissions converted from array format');
    } catch (error) {
      console.error('Error converting from array:', error);
      toast.error('Conversion Error', 'Failed to convert permissions from array format');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Permission Converter</CardTitle>
        <CardDescription>
          Convert permissions between object and array formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="object" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="object">Object Format</TabsTrigger>
            <TabsTrigger value="array">Array Format</TabsTrigger>
          </TabsList>
          <TabsContent value="object" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Edit the permissions in object format:
              </p>
              <Textarea
                value={objectInput}
                onChange={(e) => setObjectInput(e.target.value)}
                className="font-mono h-[300px]"
              />
            </div>
            <Button onClick={handleConvertFromObject}>
              Convert from Object
            </Button>
          </TabsContent>
          <TabsContent value="array" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Edit the permissions in array format:
              </p>
              <Textarea
                value={arrayInput}
                onChange={(e) => setArrayInput(e.target.value)}
                className="font-mono h-[300px]"
              />
            </div>
            <Button onClick={handleConvertFromArray}>
              Convert from Array
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          This component demonstrates how to use the permission conversion utilities.
        </p>
      </CardFooter>
    </Card>
  );
}
