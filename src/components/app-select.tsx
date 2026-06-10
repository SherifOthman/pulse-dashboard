/**
 * AppSelect – a thin wrapper around HeroUI v3 Select.
 *
 * Uses dot-notation compound components and forwards common props cleanly.
 */
import { Label, ListBox, Select } from '@heroui/react'

export type SelectOption = {
  id: string
  label: string
}

type AppSelectProps = {
  options: SelectOption[]
  value?: string
  onChange?: (key: string) => void
  placeholder?: string
  isDisabled?: boolean
  className?: string
  label?: string
  variant?: 'primary' | 'secondary'
}

export function AppSelect({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  isDisabled,
  className = '',
  label,
  variant,
}: AppSelectProps) {
  return (
    <Select
      value={value || null}
      onChange={(key) => onChange?.(key as string)}
      isDisabled={isDisabled}
      className={className}
      placeholder={placeholder}
      variant={variant}
    >
      {label && <Label>{label}</Label>}
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {options.map((opt) => (
            <ListBox.Item key={opt.id} id={opt.id} textValue={opt.label} dir="rtl">
              {opt.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}
