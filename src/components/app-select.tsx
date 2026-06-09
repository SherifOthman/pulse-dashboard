/**
 * AppSelect – a convenience wrapper around HeroUI v3's compound Select.
 * HeroUI v3 Select is based on react-aria-components and uses
 * ListBox + ListBoxItem for options.
 */
import { Select, SelectTrigger, SelectValue, SelectIndicator, SelectPopover, ListBox, ListBoxItem } from '@heroui/react'

export type SelectOption = {
  id: string
  label: string
}

type AppSelectProps = {
  options: SelectOption[]
  selectedKey?: string
  onSelectionChange?: (key: string) => void
  placeholder?: string
  isDisabled?: boolean
  className?: string
  label?: string
}

export function AppSelect({
  options,
  selectedKey,
  onSelectionChange,
  placeholder = 'اختر...',
  isDisabled,
  className = '',
}: AppSelectProps) {
  return (
    <Select
      selectedKey={selectedKey || null}
      onSelectionChange={(key) => onSelectionChange?.(key as string)}
      isDisabled={isDisabled}
      className={className}
      placeholder={placeholder}
    >
      <SelectTrigger className="min-w-40">
        <SelectValue />
        <SelectIndicator />
      </SelectTrigger>
      <SelectPopover>
        <ListBox>
          {options.map((opt) => (
            <ListBoxItem key={opt.id} id={opt.id}>
              {opt.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </SelectPopover>
    </Select>
  )
}
