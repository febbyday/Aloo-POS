import { Button } from '@/components/ui/button'

interface NumpadInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
}

export function NumpadInput({ value, onChange, onSubmit }: NumpadInputProps) {
  const handleNumClick = (num: string) => {
    if (num === 'C') {
      onChange('')
    } else if (num === '⌫') {
      onChange(value.slice(0, -1))
    } else if (num === '.' && value.includes('.')) {
      return
    } else {
      onChange(value + num)
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {[7, 8, 9, 4, 5, 6, 1, 2, 3, '.', 0, '⌫'].map((num) => (
        <Button
          key={num}
          variant="outline"
          className="h-12 text-lg"
          onClick={() => handleNumClick(num.toString())}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="outline"
        className="h-12 text-lg"
        onClick={() => handleNumClick('C')}
      >
        C
      </Button>
      <Button
        className="h-12 text-lg col-span-2"
        onClick={onSubmit}
      >
        Enter
      </Button>
    </div>
  )
}
