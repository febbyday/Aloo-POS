import { 
  PlusCircle as Plus,
  FileDown,
  Filter,
  RefreshCw,
  Search,
  Paintbrush,
  History,
  Settings,
} from 'lucide-react';

import { Toolbar } from "@/components/ui/toolbar/toolbar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from "react";

interface GiftCardsToolbarProps {
  onRefresh: () => void;
  onFilter: () => void;
  onExport: () => void;
  onAddGiftCard: () => void;
  onSearch: (query: string) => void;
  onManageDesigns: () => void;
  onViewHistory: () => void;
  onSettings: () => void;
}

export function GiftCardsToolbar({
  onRefresh,
  onFilter,
  onExport,
  onAddGiftCard,
  onSearch,
  onManageDesigns,
  onViewHistory,
  onSettings,
}: GiftCardsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const toolbarGroups = [
    {
      buttons: [
        { 
          icon: Plus, 
          label: "New Gift Card", 
          onClick: onAddGiftCard 
        },
        { 
          icon: Paintbrush, 
          label: "Designs", 
          onClick: onManageDesigns 
        },
        { 
          icon: History, 
          label: "History", 
          onClick: onViewHistory 
        },
        { 
          icon: Settings, 
          label: "Settings", 
          onClick: onSettings 
        }
      ]
    },
    {
      buttons: [
        { 
          icon: RefreshCw, 
          label: "Refresh", 
          onClick: onRefresh 
        },
        { 
          icon: Filter, 
          label: "Filter", 
          onClick: onFilter 
        },
        { 
          icon: FileDown, 
          label: "Export", 
          onClick: onExport 
        }
      ]
    }
  ];

  const rightContent = (
    <div className="flex items-center gap-2">
      <Input
        className="h-8 w-[250px] bg-background"
        placeholder="Search gift cards..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={handleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Toolbar 
      groups={toolbarGroups}
      rightContent={rightContent}
    />
  );
} 