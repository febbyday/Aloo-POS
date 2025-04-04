import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmploymentType } from "../types/employmentType"
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface EmploymentTypeCardProps {
  type: EmploymentType
  onEdit: (type: EmploymentType) => void
  onDelete: (type: EmploymentType) => void
  employeeCount?: number
}

export const EmploymentTypeCard = ({ type, onEdit, onDelete, employeeCount = 0 }: EmploymentTypeCardProps) => {
  return (
    <Card className="relative hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: type.color }}
            />
            <CardTitle className="text-lg">{type.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(type)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(type)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2">{type.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-sm">{employeeCount} employee{employeeCount !== 1 ? 's' : ''}</span>
          </div>
          <Badge variant="secondary" className="font-normal">
            {type.benefits.length} benefit{type.benefits.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Benefits</h4>
          <div className="flex flex-wrap gap-2">
            {type.benefits.map((benefit, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-secondary/50 text-secondary-foreground rounded-md text-sm"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 