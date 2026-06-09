/**
 * AppSelect – a convenience wrapper around HeroUI v3's compound Select.
 * HeroUI v3 Select is based on react-aria-components and uses
 * ListBox + ListBoxItem for options.
 */
import {
  ListBox,
  ListBoxItem,
  Select,
  SelectIndicator,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@heroui/react";

export type SelectOption = {
  id: string;
  label: string;
};

type AppSelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (key: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  label?: string;
};

export function AppSelect({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  isDisabled,
  className = "",
}: AppSelectProps) {
  return (
    <Select
      value={value || null}
      onChange={(key) => onChange?.(key as string)}
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
            <ListBoxItem key={opt.id} id={opt.id} dir="rtl">
              {opt.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </SelectPopover>
    </Select>
  );
}
