import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { 
  addDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  subMonths, 
  addMonths,
  getDay,
  isToday,
  isBefore,
  isAfter,
  parseISO
} from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DateRange {
  from?: Date
  to?: Date
}

interface CustomCalendarProps {
  mode?: "single" | "range"
  selected?: DateRange
  onSelect?: (range: DateRange) => void
  numberOfMonths?: number
  defaultMonth?: Date
  className?: string
  disabledDates?: Date[]
}

export function CustomCalendar({
  mode = "range",
  selected,
  onSelect,
  numberOfMonths = 2,
  defaultMonth = new Date(),
  className,
  disabledDates = [],
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth)
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)
  const [slideDirection, setSlideDirection] = React.useState<"left" | "right">("right")

  const months = React.useMemo(() => {
    return Array.from({ length: numberOfMonths }, (_, i) => {
      const month = addMonths(currentMonth, i)
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      return eachDayOfInterval({ start, end })
    })
  }, [currentMonth, numberOfMonths])

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const handleDateClick = (date: Date) => {
    if (!onSelect || isDateDisabled(date)) return

    if (mode === "single") {
      onSelect({ from: date, to: date })
    } else {
      if (!selected?.from) {
        onSelect({ from: date })
      } else if (!selected.to && selected.from) {
        if (date < selected.from) {
          onSelect({ from: date, to: selected.from })
        } else {
          onSelect({ from: selected.from, to: date })
        }
      } else {
        onSelect({ from: date })
      }
    }
  }

  const isInRange = (date: Date) => {
    if (!selected?.from || isDateDisabled(date)) return false
    if (!selected.to) {
      if (!hoveredDate) return false
      return (
        (date >= selected.from && date <= hoveredDate) ||
        (date >= hoveredDate && date <= selected.from)
      )
    }
    return date >= selected.from && date <= selected.to
  }

  const isDateDisabled = (date: Date) => {
    return disabledDates.some(disabledDate => 
      isSameDay(parseISO(disabledDate.toISOString()), date)
    )
  }

  const handlePrevMonth = () => {
    setSlideDirection("left")
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setSlideDirection("right")
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handleTodayClick = () => {
    setSlideDirection("right")
    setCurrentMonth(new Date())
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between px-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleTodayClick}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go to today</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-8 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {months.map((month, monthIndex) => (
              <motion.div
                key={format(month[0], "yyyy-MM")}
                className="space-y-4"
                initial={{ 
                  x: slideDirection === "right" ? "100%" : "-100%",
                  opacity: 0 
                }}
                animate={{ 
                  x: 0,
                  opacity: 1 
                }}
                exit={{ 
                  x: slideDirection === "right" ? "-100%" : "100%",
                  opacity: 0 
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day, index) => (
                    <div
                      key={day}
                      className={cn(
                        "h-8 w-8 text-xs font-medium flex items-center justify-center",
                        [0, 6].includes(index) ? "bg-muted/50" : "text-muted-foreground"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                  {month.map((date, i) => {
                    const isSelected = selected?.from && isSameDay(date, selected.from) || 
                                     selected?.to && isSameDay(date, selected.to)
                    const isRangeStart = selected?.from && isSameDay(date, selected.from)
                    const isRangeEnd = selected?.to && isSameDay(date, selected.to)
                    const isWithinRange = isInRange(date)
                    const isCurrentMonth = isSameMonth(date, month[0])
                    const isWeekendDay = [6, 0].includes(getDay(date)) // Saturday = 6, Sunday = 0
                    const isTodayDate = isToday(date)
                    const isDisabled = isDateDisabled(date)

                    return (
                      <TooltipProvider key={i}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className="relative"
                              whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                              whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                            >
                              <button
                                type="button"
                                onClick={() => handleDateClick(date)}
                                onMouseEnter={() => !isDisabled && setHoveredDate(date)}
                                onMouseLeave={() => setHoveredDate(null)}
                                className={cn(
                                  "h-8 w-8 p-0 font-normal rounded-full transition-all relative",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                  isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                  !isSelected && !isDisabled && "hover:bg-accent hover:text-accent-foreground",
                                  isWithinRange && !isSelected && "bg-primary/20 text-primary hover:bg-primary/30",
                                  !isCurrentMonth && "text-muted-foreground/50",
                                  isWeekendDay && !isSelected && !isWithinRange && !isDisabled && "bg-muted/50 hover:bg-muted/70",
                                  isTodayDate && !isSelected && !isWithinRange && "border-2 border-primary/50",
                                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                                  (isRangeStart || isRangeEnd) && "bg-primary text-primary-foreground",
                                  isRangeStart && "rounded-r-none after:absolute after:inset-y-0 after:right-0 after:w-1/2 after:bg-primary/20",
                                  isRangeEnd && "rounded-l-none before:absolute before:inset-y-0 before:left-0 before:w-1/2 before:bg-primary/20"
                                )}
                                disabled={!isCurrentMonth || isDisabled}
                              >
                                <time dateTime={format(date, "yyyy-MM-dd")}>
                                  {format(date, "d")}
                                </time>
                                {(isRangeStart || isRangeEnd) && (
                                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                )}
                              </button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(date, "EEEE, MMMM do, yyyy")}
                            {isDisabled && " (Disabled)"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
