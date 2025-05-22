import { Bell, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/theme-toggle'

function POSHeader() {
  return (
    <header className="h-14 border-b border-border bg-background px-4">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-lg font-semibold">Point of Sale</div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          <ThemeToggle />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-foreground">
              <User className="h-5 w-5" />
            </Button>
            <div className="text-sm">
              <div className="font-medium text-foreground">John Doe</div>
              <div className="text-muted-foreground">Cashier</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function POSFooter() {
  return (
    <footer className="h-8 border-t border-border bg-background px-4">
      <div className="flex h-full items-center justify-between text-sm text-muted-foreground">
        <div>&copy; 2025 POS System</div>
        <div className="flex items-center gap-4">
          <div>Terminal: POS-001</div>
          <div>Store: Main Branch</div>
        </div>
      </div>
    </footer>
  )
}

export function POSLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <POSHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <POSFooter />
    </div>
  )
}
