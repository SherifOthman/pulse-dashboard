/**
 * WorkingDaysField
 *
 * Reusable working-days editor used in both the doctor form and branch form.
 * Renders 7 rows (Sun–Sat) with a HeroUI Checkbox and two TimeField pickers.
 */
import { useRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Checkbox, TimeField } from '@heroui/react'
import { Time } from '@internationalized/date'

export type WorkingDayEntry = {
  day: number        // 0=Sunday … 6=Saturday
  startTime: string  // "HH:mm"
  endTime: string    // "HH:mm"
  enabled: boolean
}

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function toTime(s: string): Time {
  const [h, m] = s.split(':')
  return new Time(Number(h), Number(m))
}

function fromTime(t: Time): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

type Props = {
  /** react-hook-form field array name, e.g. "workingDays" */
  name?: string
}

export function WorkingDaysField({ name = 'workingDays' }: Props) {
  const { control, watch, setValue } = useFormContext()
  const wds: WorkingDayEntry[] = watch(name)
  const lastTime = useRef({ startTime: '09:00', endTime: '17:00' })

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">أيام العمل</label>
      <div className="flex flex-col gap-1.5 overflow-hidden">
        {wds.map((wd, i) => (
          <div
            key={i}
            className={`rounded-xl border px-3 py-2.5 transition-colors isolate ${
              wd.enabled ? 'border-divider bg-surface' : 'border-dashed border-divider/60 bg-transparent'
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              {/* Day checkbox */}
              <Controller
                control={control}
                name={`${name}.${i}.enabled`}
                render={({ field }) => (
                  <Checkbox
                    isSelected={field.value}
                    onChange={(v) => {
                      field.onChange(v)
                      if (v) {
                        setValue(`${name}.${i}.startTime`, lastTime.current.startTime)
                        setValue(`${name}.${i}.endTime`, lastTime.current.endTime)
                      }
                    }}
                  >
                    <Checkbox.Control className="bg-field-background border border-divider rounded">
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <span className="text-sm text-foreground min-w-[4rem]">{DAY_NAMES[i]}</span>
                  </Checkbox>
                )}
              />

              {/* Time pickers — only visible when day is enabled */}
              {wd.enabled && (
                <div className="flex items-center gap-2 flex-1 min-w-0" dir="ltr">
                  <TimeField
                    value={toTime(wd.startTime)}
                    onChange={(t: Time | null) => {
                      if (t) {
                        const s = fromTime(t)
                        setValue(`${name}.${i}.startTime`, s, { shouldDirty: true })
                        lastTime.current.startTime = s
                      }
                    }}
                    className="flex-1"
                    aria-label={`${DAY_NAMES[i]} وقت البداية`}
                  >
                    <TimeField.Group variant="secondary" className="w-full">
                      <TimeField.Input>
                        {(segment) => <TimeField.Segment segment={segment} />}
                      </TimeField.Input>
                    </TimeField.Group>
                  </TimeField>

                  <span className="text-muted shrink-0 text-sm">–</span>

                  <TimeField
                    value={toTime(wd.endTime)}
                    onChange={(t: Time | null) => {
                      if (t) {
                        const s = fromTime(t)
                        setValue(`${name}.${i}.endTime`, s, { shouldDirty: true })
                        lastTime.current.endTime = s
                      }
                    }}
                    className="flex-1"
                    aria-label={`${DAY_NAMES[i]} وقت النهاية`}
                  >
                    <TimeField.Group variant="secondary" className="w-full">
                      <TimeField.Input>
                        {(segment) => <TimeField.Segment segment={segment} />}
                      </TimeField.Input>
                    </TimeField.Group>
                  </TimeField>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Default working day entries — all disabled, 09:00–17:00 */
export const defaultWorkingDays: WorkingDayEntry[] = Array.from({ length: 7 }, (_, i) => ({
  day: i,
  startTime: '09:00',
  endTime: '17:00',
  enabled: false,
}))

/** Map existing backend WorkingDayDto array to form entries */
export function mapWorkingDaysToForm(
  days: { day: number; startTime: string; endTime: string }[],
): WorkingDayEntry[] {
  const map = new Map(days.map((d) => [d.day, d]))
  return defaultWorkingDays.map((def) => {
    const existing = map.get(def.day)
    return existing
      ? { ...def, enabled: true, startTime: existing.startTime, endTime: existing.endTime }
      : def
  })
}

/** Convert enabled form entries back to WorkingDayDto array for the API */
export function formToWorkingDays(
  entries: WorkingDayEntry[],
): { day: number; startTime: string; endTime: string }[] | undefined {
  const enabled = entries.filter((d) => d.enabled)
  return enabled.length > 0
    ? enabled.map((d) => ({ day: d.day, startTime: d.startTime, endTime: d.endTime }))
    : undefined
}
