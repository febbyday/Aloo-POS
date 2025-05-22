import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from '@/lib/utils';
import {
  Bell,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  FileText,
  Flag,
  Info,
  Megaphone,
  Plus,
  ShieldAlert,
  Tag,
  Timer,
  TrendingUp,
} from "lucide-react"

interface TimelineEvent {
  id: string
  type: 'milestone' | 'task' | 'status' | 'notification'
  title: string
  description: string
  date: Date
  status?: 'completed' | 'pending' | 'overdue' | 'upcoming'
  priority?: 'low' | 'medium' | 'high'
  icon?: any
}

interface MarketTimelineProps {
  events: TimelineEvent[]
}

const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'milestone',
    title: 'Market Launch',
    description: 'Successfully launched the market with 100+ products',
    date: new Date('2025-01-15'),
    status: 'completed',
    icon: Flag,
  },
  {
    id: '2',
    type: 'status',
    title: 'Status Changed to Active',
    description: 'Market status updated from "Setup" to "Active"',
    date: new Date('2025-01-15'),
    icon: CircleDot,
  },
  {
    id: '3',
    type: 'notification',
    title: 'High Performance Alert',
    description: 'Market exceeded monthly sales target by 25%',
    date: new Date('2025-02-01'),
    priority: 'high',
    icon: TrendingUp,
  },
  {
    id: '4',
    type: 'task',
    title: 'Quarterly Inventory Audit',
    description: 'Conduct comprehensive inventory check',
    date: new Date('2025-02-28'),
    status: 'upcoming',
    priority: 'medium',
    icon: FileText,
  },
  {
    id: '5',
    type: 'notification',
    title: 'Safety Inspection Due',
    description: 'Schedule annual safety inspection',
    date: new Date('2025-03-15'),
    priority: 'high',
    icon: ShieldAlert,
  },
  {
    id: '6',
    type: 'milestone',
    title: 'First 1000 Transactions',
    description: 'Reached 1000 successful transactions',
    date: new Date('2025-02-10'),
    status: 'completed',
    icon: CheckCircle2,
  },
]

const getEventStyles = (event: TimelineEvent) => {
  const baseIconClass = "h-5 w-5"
  
  switch (event.type) {
    case 'milestone':
      return {
        iconClass: cn(baseIconClass, "text-blue-500"),
        bgClass: "bg-blue-500/10",
        borderClass: "border-blue-500/20",
      }
    case 'task':
      return {
        iconClass: cn(baseIconClass, "text-purple-500"),
        bgClass: "bg-purple-500/10",
        borderClass: "border-purple-500/20",
      }
    case 'status':
      return {
        iconClass: cn(baseIconClass, "text-green-500"),
        bgClass: "bg-green-500/10",
        borderClass: "border-green-500/20",
      }
    case 'notification':
      return {
        iconClass: cn(baseIconClass, "text-orange-500"),
        bgClass: "bg-orange-500/10",
        borderClass: "border-orange-500/20",
      }
    default:
      return {
        iconClass: baseIconClass,
        bgClass: "bg-gray-500/10",
        borderClass: "border-gray-500/20",
      }
  }
}

const getPriorityBadge = (priority?: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="secondary" className="bg-red-500/10 text-red-500">High Priority</Badge>
    case 'medium':
      return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Medium Priority</Badge>
    case 'low':
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Low Priority</Badge>
    default:
      return null
  }
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="secondary" className="bg-green-500/10 text-green-500">Completed</Badge>
    case 'pending':
      return <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">Pending</Badge>
    case 'overdue':
      return <Badge variant="secondary" className="bg-red-500/10 text-red-500">Overdue</Badge>
    case 'upcoming':
      return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Upcoming</Badge>
    default:
      return null
  }
}

export function MarketTimeline({ events = mockEvents }: MarketTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <Card className="p-6 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Market Timeline</h3>
          <p className="text-sm text-muted-foreground">Key events, tasks, and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 cursor-pointer">
            <Flag className="h-3 w-3 mr-1" />
            Milestones
          </Badge>
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 cursor-pointer">
            <Timer className="h-3 w-3 mr-1" />
            Tasks
          </Badge>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 cursor-pointer">
            <Tag className="h-3 w-3 mr-1" />
            Status
          </Badge>
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 cursor-pointer">
            <Bell className="h-3 w-3 mr-1" />
            Notifications
          </Badge>
        </div>

        <div className="relative">
          <div className="absolute left-[21px] top-3 bottom-3 w-px bg-border" />
          
          <div className="space-y-6">
            {sortedEvents.map((event, index) => {
              const styles = getEventStyles(event)
              
              return (
                <div key={event.id} className="relative">
                  <div className="flex gap-4">
                    <div className={cn("rounded-full p-2 mt-1", styles.bgClass)}>
                      {event.icon && <event.icon className={styles.iconClass} />}
                    </div>
                    
                    <div className="flex-1 bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-muted-foreground">
                            {event.date.toLocaleDateString()}
                          </div>
                          {event.priority && getPriorityBadge(event.priority)}
                          {event.status && getStatusBadge(event.status)}
                        </div>
                      </div>
                      
                      {event.type === 'task' && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Due in {Math.ceil((event.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
                          </div>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
