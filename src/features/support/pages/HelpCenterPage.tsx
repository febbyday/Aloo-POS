import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Book, 
  FileQuestion, 
  Headphones, 
  LifeBuoy, 
  Mail, 
  MessageCircle, 
  Phone, 
  Search, 
  Video 
} from "lucide-react"
import { cn } from "@/lib/utils"

export function HelpCenterPage() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const helpSections = [
    {
      id: "getting-started",
      name: "Getting Started",
      icon: Book,
      content: [
        { title: "Introduction to POS System", link: "#" },
        { title: "Quick Start Guide", link: "#" },
        { title: "Basic Navigation", link: "#" },
        { title: "Setting Up Your Store", link: "#" },
      ]
    },
    {
      id: "tutorials",
      name: "Video Tutorials",
      icon: Video,
      content: [
        { title: "Processing Sales", link: "#" },
        { title: "Managing Inventory", link: "#" },
        { title: "Customer Management", link: "#" },
        { title: "Reports and Analytics", link: "#" },
      ]
    },
    {
      id: "faqs",
      name: "FAQs",
      icon: FileQuestion,
      content: [
        { title: "Common Issues", link: "#" },
        { title: "Troubleshooting", link: "#" },
        { title: "System Requirements", link: "#" },
        { title: "Security Best Practices", link: "#" },
      ]
    },
    {
      id: "support",
      name: "Contact Support",
      icon: Headphones,
      content: [
        { title: "Submit a Ticket", link: "#" },
        { title: "Live Chat", link: "#" },
        { title: "Phone Support", link: "#" },
        { title: "Email Support", link: "#" },
      ]
    }
  ]

  const renderContent = (sectionId: string) => {
    const section = helpSections.find(s => s.id === sectionId)
    if (!section) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <section.icon className="h-6 w-6" />
          <h2 className="text-2xl font-semibold">{section.name}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {section.content.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="link" className="px-0">Learn more →</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Help Center Navigation Sidebar */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Help Center</h2>
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search help articles..." className="pl-8" />
            </div>
          </div>
        </div>
        <nav className="p-2">
          {helpSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                activeSection === section.id 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <section.icon className="h-4 w-4" />
              {section.name}
            </button>
          ))}
        </nav>

        {/* Quick Contact Options */}
        <div className="absolute bottom-0 w-64 border-t border-border p-4 bg-card">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="mr-2 h-4 w-4" />
              Live Chat
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Phone className="mr-2 h-4 w-4" />
              Call Support
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </div>
        </div>
      </div>

      {/* Help Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full p-6">
          {renderContent(activeSection)}
        </div>
      </div>
    </div>
  )
}
