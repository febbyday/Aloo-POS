import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Search,
  Plus,
  RefreshCw,
  UserPlus,
  UserMinus,
  Edit,
  Clock,
  User2,
  Loader2
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useStaff } from '@/features/staff/hooks/useStaff'
import { Staff } from '@/features/staff/types'
import { shopsService } from '../services/shopsService'
import { ShopStaffMember } from '../types/shops.types'

interface ShopStaff {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'on_leave';
  shift: string;
  lastClockIn?: Date;
  lastClockOut?: Date;
}

export function ShopStaffPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const [staff, setStaff] = useState<ShopStaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // Use the staff hook to get all staff
  const { 
    items: allStaff, 
    loading: loadingStaff, 
    refresh: refreshStaff 
  } = useStaff({ 
    autoLoad: true 
  });

  // Fetch shop staff data
  useEffect(() => {
    if (!shopId) return;
    
    async function fetchShopStaff() {
      setLoading(true);
      try {
        const shop = await shopsService.fetchById(shopId);
        if (shop && shop.staffMembers) {
          setStaff(shop.staffMembers);
        }
      } catch (error) {
        console.error('Error fetching shop staff:', error);
        toast({
          title: "Error",
          description: "Failed to load staff information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchShopStaff();
  }, [shopId, toast]);

  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    if (!shopId) return;
    
    setLoading(true);
    toast({
      title: "Refreshing data...",
      description: "Staff data is being updated."
    });
    
    try {
      const shop = await shopsService.fetchById(shopId, true); // force refresh
      if (shop && shop.staffMembers) {
        setStaff(shop.staffMembers);
      }
      refreshStaff(); // Also refresh all staff data
      
      toast({
        title: "Updated",
        description: "Staff data has been refreshed."
      });
    } catch (error) {
      console.error('Error refreshing shop staff:', error);
      toast({
        title: "Error",
        description: "Failed to refresh staff information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    toast({
      title: "Coming Soon",
      description: "The ability to add new staff will be available soon."
    });
  };

  const handleEditStaff = (staff: ShopStaffMember) => {
    toast({
      title: "Coming Soon",
      description: "The ability to edit staff will be available soon."
    });
  };

  const handleRemoveStaff = (staff: ShopStaffMember) => {
    toast({
      title: "Coming Soon",
      description: "The ability to remove staff will be available soon."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shop Staff</h2>
          <p className="text-muted-foreground">
            Manage staff members for this shop location
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={handleAddStaff}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search staff..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <User2 className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Staff Members</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "No staff members match your search criteria." 
                  : "This shop doesn't have any staff members assigned yet."}
              </p>
              <Button variant="outline" onClick={handleAddStaff}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredStaff.map((staffMember) => (
                <Card key={staffMember.id} className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-semibold">{staffMember.name}</CardTitle>
                        <CardDescription>{staffMember.position}</CardDescription>
                      </div>
                      <Badge variant={staffMember.active ? "success" : "secondary"}>
                        {staffMember.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-4">
                      {staffMember.email && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Email:</span>{" "}
                          <span>{staffMember.email}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleEditStaff(staffMember)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handleRemoveStaff(staffMember)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
