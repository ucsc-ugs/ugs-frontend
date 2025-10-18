import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  displayValue?: string
  children: React.ReactNode
  className?: string
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
  value?: string
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
  onSelect?: (value: string) => void
  selectedValue?: string
  onClose?: () => void
}

interface SelectItemProps {
  className?: string
  children: React.ReactNode
  value: string
  onSelect?: (value: string) => void
  isSelected?: boolean
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, className, displayValue, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(value)

  // Keep internal selectedValue in sync when parent changes `value`
  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])
  
  const handleSelect = (itemValue: string) => {
    setSelectedValue(itemValue)
    onValueChange?.(itemValue)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)} {...props}>
      {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            if (child.type === SelectTrigger) {
              return React.cloneElement(child, {
                onClick: () => setIsOpen(!isOpen),
                'aria-expanded': isOpen,
                selectedValue,
                displayValue
              } as any)
            }
            if (child.type === SelectContent) {
              return isOpen ? React.cloneElement(child, {
                onSelect: handleSelect,
                selectedValue,
                onClose: () => setIsOpen(false)
              } as any) : null
            }
          }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
  // allow selectedValue and displayValue to be passed into trigger via cloneElement
  const selectedValue = (props as any).selectedValue as string | undefined
  const displayValue = (props as any).displayValue as string | undefined

    // If children include a SelectValue, clone it with the current selectedValue so it displays the chosen text
  const renderedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child) && (child.type as any) === SelectValue) {
    return React.cloneElement(child as React.ReactElement<any>, { value: displayValue ?? selectedValue } as any)
      }
      // If child is a wrapper element (e.g. a div containing icon + SelectValue), check its children too
      if (React.isValidElement(child) && (child as any).props && (child as any).props.children) {
        const inner = React.Children.map((child as any).props.children, (c: any) => {
          if (React.isValidElement(c) && (c.type as any) === SelectValue) {
            return React.cloneElement(c as React.ReactElement<any>, { value: displayValue ?? selectedValue } as any)
          }
          return c
        })
        return React.cloneElement(child as React.ReactElement<any>, {}, inner)
      }
      return child
    })

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {renderedChildren}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, value, ...props }) => (
  <span className="block truncate" {...props}>
    {value || placeholder}
  </span>
)

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, onSelect, selectedValue, onClose, ...props }, ref) => {
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && typeof ref === 'object' && ref.current && !ref.current.contains(event.target as Node)) {
          onClose?.()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose, ref])

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md mt-1 w-full",
          className
        )}
        {...props}
      >
        <div className="p-1 max-h-60 overflow-auto">
          {React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              return React.cloneElement(child, {
                onSelect,
                isSelected: (child.props as any).value === selectedValue
              } as any)
            }
            return child
          })}
        </div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, onSelect, isSelected, disabled = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => { if (!disabled) onSelect?.(value) }}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }