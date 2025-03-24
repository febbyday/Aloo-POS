// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";

interface Repair {
  id: string;
  ticketNumber: string;
  customerName: string;
  deviceType: string;
  issue: string;
  status: string;
  estimatedCost: number;
  createdAt: string;
}

interface ActionMenuProps {
  repair: Repair;
  onView: (repair: Repair) => void;
  onEdit: (repair: Repair) => void;
  onDelete: (repair: Repair) => void;
}

export function ActionMenu({ repair, onView, onEdit, onDelete }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(repair)}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View details</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(repair)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit repair</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(repair)} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete repair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
