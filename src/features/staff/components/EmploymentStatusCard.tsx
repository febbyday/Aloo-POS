import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmploymentStatus } from "../types/employmentStatus"
import { MoreHorizontal, Pencil, Trash2, Users, Clock, CheckCircle2, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatDistance } from 'date-fns'

interface EmploymentStatusCardProps {
  status: EmploymentStatus
  onEdit: (status: EmploymentStatus) => void
  onDelete: (status: EmploymentStatus) => void
  employeeCount?: number
}

export const EmploymentStatusCard = ({ status, onEdit, onDelete, employeeCount = 0 }: EmploymentStatusCardProps) => {
  // Format dates if they exist
  const updatedAtFormatted = status.updatedAt 
    ? formatDistance(new Date(status.updatedAt), new Date(), { addSuffix: true })
    : 'Not updated';
  
  // Access benefits directly from status
  const benefits = status.benefits || [];
  
  return (
    <Card className={`relative hover:shadow-md transition-shadow duration-200 ${!status.isActive ? 'opacity-70' : ''}`}>
      <div 
        className="absolute top-0 left-0 w-full h-1" 
        style={{ backgroundColor: status.color }}
      />
      <CardHeader className="pb-3 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: status.color }}
            />
            <CardTitle className="text-lg">{status.name}</CardTitle>
            {status.isActive ? 
              <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
              <XCircle className="h-4 w-4 text-gray-400" />
            }
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(status)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(status)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2">{status.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">{employeeCount} employee{employeeCount !== 1 ? 's' : ''}</span>
          </div>
          <Badge 
            variant="outline" 
            style={{ 
              borderColor: status.color,
              color: status.color
            }}
            className="font-normal"
          >
            {benefits.length} benefit{benefits.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        {benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Benefits</h4>
            <div className="flex flex-wrap gap-2 max-h-20 overflow-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-xs"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-3 flex justify-start">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {updatedAtFormatted}</span>
        </div>
      </CardFooter>
    </Card>
  )
} 