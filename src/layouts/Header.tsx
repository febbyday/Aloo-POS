import { Bell, Sun, Moon, User, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { Link } from 'react-router-dom'

export function Header() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <header className="h-16 border-b border-border bg-background px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <Button asChild variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/pos">
              <ShoppingCart className="h-4 w-4 mr-2" />
              POS Mode
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-foreground">
              <User className="h-5 w-5" />
            </Button>
            <div className="text-sm">
              <div className="font-medium text-foreground">John Doe</div>
              <div className="text-muted-foreground">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
