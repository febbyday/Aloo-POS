import { 
  CreditCard, 
  FileDown, 
  Filter, 
  PlusCircle, 
  RefreshCw,
  Search,
  Wallet,
  Paintbrush,
  History,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

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
  return (
    <div className="flex items-center justify-between border rounded-lg bg-card p-2">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9"
          onClick={onAddGiftCard}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Gift Card
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9"
          onClick={onManageDesigns}
        >
          <Paintbrush className="h-4 w-4 mr-2" />
          Manage Designs
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9"
          onClick={onViewHistory}
        >
          <History className="h-4 w-4 mr-2" />
          Transaction History
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9"
          onClick={onSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={onFilter}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={onExport}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search gift cards..."
            className="w-[200px] pl-8 h-9"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
} 