/**
 * PhoneNumbersField
 *
 * Dynamic list of phone number inputs (number + optional type).
 * Used in both doctor form and branch form.
 */
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button, Input } from '@heroui/react'
import { Plus, Trash2 } from 'lucide-react'

type Props = {
  /** react-hook-form field array name, e.g. "phoneNumbers" */
  name?: string
}

export function PhoneNumbersField({ name = 'phoneNumbers' }: Props) {
  const { control, register, formState: { errors } } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">أرقام التواصل</label>
        <Button
          size="sm"
          variant="ghost"
          onPress={() => append({ number: '', type: '' })}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          إضافة
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted py-1">لا توجد أرقام، اضغط على إضافة</p>
      )}

      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <div key={field.id} className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <Input
                {...register(`${name}.${i}.number`)}
                variant="secondary"
                placeholder="رقم الهاتف"
                dir="ltr"
                className="flex-1"
                aria-label="رقم الهاتف"
              />
              <Input
                {...register(`${name}.${i}.type`)}
                variant="secondary"
                placeholder="النوع (اختياري)"
                className="w-28 shrink-0"
                aria-label="نوع الرقم"
              />
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={() => remove(i)}
                type="button"
                aria-label="حذف الرقم"
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
            {(errors as any)[name]?.[i]?.number?.message && (
              <p className="text-xs text-danger">{(errors as any)[name][i].number.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
