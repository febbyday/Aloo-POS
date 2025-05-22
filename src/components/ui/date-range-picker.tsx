import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { 
  addDays, 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  subQuarters,
  startOfQuarter,
  endOfQuarter
} from "date-fns"
import { motion } from "framer-motion"

import { cn } from '@/lib/utils/cn';
import { Button } from "@/components/ui/button"
import { CustomCalendar } from "@/components/ui/custom-calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
  disabledDates?: Date[]
}

const presets = [
  {
    label: 'Today',
    value: 'today',
    range: {
      from: new Date(),
      to: new Date()
    }
  },
  {
    label: 'This Week',
    value: 'thisWeek',
    range: {
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 })
    }
  },
  {
    label: 'This Month',
    value: 'thisMonth',
    range: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    }
  },
  {
    label: 'Last 7 days',
    value: '7days',
    range: {
      from: addDays(new Date(), -7),
      to: new Date()
    }
  },
  {
    label: 'Last 30 days',
    value: '30days',
    range: {
      from: addDays(new Date(), -30),
      to: new Date()
    }
  },
  {
    label: 'Last Month',
    value: 'lastMonth',
    range: {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1))
    }
  },
  {
    label: 'Last Quarter',
    value: 'lastQuarter',
    range: {
      from: startOfQuarter(subQuarters(new Date(), 1)),
      to: endOfQuarter(subQuarters(new Date(), 1))
    }
  },
  {
    label: 'Last 90 days',
    value: '90days',
    range: {
      from: addDays(new Date(), -90),
      to: new Date()
    }
  }
]

export function DateRangePicker({
  date,
  onDateChange,
  className,
  disabledDates,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClear = () => {
    onDateChange(undefined)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              id="date"
              variant={"ghost"}
              size="sm"
              className={cn(
                "w-[280px] h-8 justify-start text-left font-normal",
                "bg-transparent border-zinc-700 text-zinc-100",
                "hover:bg-white/5 active:bg-white/10 transition-all duration-200",
                "relative overflow-hidden group",
                !date && "text-muted-foreground"
              )}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <CalendarIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-zinc-900 border-zinc-700"
          align="start"
        >
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col sm:flex-row border rounded-lg overflow-hidden bg-zinc-900 border-zinc-700"
          >
            <div className="p-3 border-b sm:border-b-0 sm:border-r border-zinc-700 bg-zinc-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-zinc-100">Quick Select</h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
                        onClick={handleClear}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear selection</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                onValueChange={(value) => {
                  const preset = presets.find((p) => p.value === value)
                  if (preset) {
                    onDateChange(preset.range)
                    setIsOpen(false)
                  }
                }}
              >
                <SelectTrigger className="w-[180px] bg-zinc-800/50 border-zinc-700 text-zinc-100">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-zinc-900 border-zinc-700">
                  {presets.map((preset) => (
                    <SelectItem 
                      key={preset.value} 
                      value={preset.value}
                      className="cursor-pointer hover:bg-zinc-800 transition-colors text-zinc-100"
                    >
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-zinc-900">
              <CustomCalendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={2}
                disabled={disabledDates}
              />
            </div>
          </motion.div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
