import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { shopsService } from '../services/shopsService';
import { Shop } from '../types/shops.types';
import { useToast } from '@/components/ui/use-toast';

export function ShopApiTest() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await shopsService.fetchAll();
      setShops(data);
      toast({
        title: 'Success!',
        description: `Fetched ${data.length} shops from the API.`,
      });
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch shops',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Shop API Connection Test</CardTitle>
          <CardDescription>
            Test the connection between the frontend and backend shop API
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={fetchShops} disabled={loading}>
                {loading ? 'Loading...' : 'Test Connection'}
              </Button>
            </div>
            
            {error && (
              <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
                <h3 className="font-semibold">Error:</h3>
                <p>{error.message}</p>
              </div>
            )}
            
            {shops.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Shops Retrieved:</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Location</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.map(shop => (
                        <tr key={shop.id} className="border-t">
                          <td className="p-2">{shop.id}</td>
                          <td className="p-2">{shop.name}</td>
                          <td className="p-2">{shop.location}</td>
                          <td className="p-2">{shop.type}</td>
                          <td className="p-2">{shop.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            API URL: <code>{shopsService.getApiUrl?.() || 'Not available'}</code>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 