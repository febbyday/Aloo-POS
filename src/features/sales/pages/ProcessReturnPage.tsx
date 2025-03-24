import { ArrowLeftRight } from 'lucide-react'

export function ProcessReturnPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ArrowLeftRight className="h-5 w-5" />
        Process Return
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Return processing functionality will be implemented soon
      </div>
    </div>
  )
}
