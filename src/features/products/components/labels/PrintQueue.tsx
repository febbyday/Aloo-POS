// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw
} from "lucide-react"
import { printService, PrintJob } from "../../services/printService"
import { formatDistanceToNow } from "date-fns"

export function PrintQueue() {
  const [jobs, setJobs] = useState<PrintJob[]>([])

  useEffect(() => {
    // Load initial jobs
    setJobs(printService.getJobs())

    // Subscribe to job updates
    const handleJobsUpdate = (updatedJobs: PrintJob[]) => {
      setJobs([...updatedJobs])
    }

    printService.addListener(handleJobsUpdate)
    return () => printService.removeListener(handleJobsUpdate)
  }, [])

  const handleClearCompleted = () => {
    jobs.forEach(job => {
      if (job.status === 'completed' || job.status === 'failed') {
        printService.removeJob(job.id)
      }
    })
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Print Queue</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleClearCompleted}>
              Clear Completed
            </Button>
            <Button size="sm" variant="outline" onClick={() => setJobs([...printService.getJobs()])}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[calc(100vh-15rem)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {job.status === 'pending' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {job.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {job.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {job.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="capitalize">{job.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{job.type}</TableCell>
                  <TableCell>
                    <Progress value={job.progress} className="w-[100px]" />
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(job.createdAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => printService.removeJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Add default export for the component
export default PrintQueue;
