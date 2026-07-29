"use client"

import * as React from "react"
import { CalendarDays, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "./calendar"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

// ─── shadcn 风格日期/日期时间选择器（值为字符串，与表单 config 直接兼容）─────
// DatePicker      值格式 "YYYY-MM-DD"
// DateTimePicker  值格式 "YYYY-MM-DDTHH:mm"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 手动解析，避免 "YYYY-MM-DD" 被 new Date() 按 UTC 解析导致时区偏移
function parseDateStr(v?: string): Date | undefined {
  if (!v) return undefined
  const [y, m, d] = v.slice(0, 10).split("-").map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

interface PickerTriggerProps {
  id?: string
  invalid?: boolean
  placeholder: string
  display?: string
  icon: React.ReactNode
}

// 触发器：外观与 Input 保持一致
function PickerTrigger({ id, invalid, placeholder, display, icon }: PickerTriggerProps) {
  return (
    <PopoverTrigger asChild>
      <button
        type="button"
        id={id}
        data-invalid={invalid || undefined}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--text)] transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:border-[var(--line-strong)] focus-visible:ring-2 focus-visible:ring-[var(--soft)]",
          "data-[state=open]:border-[var(--line-strong)] data-[state=open]:ring-2 data-[state=open]:ring-[var(--soft)]",
          "data-[invalid=true]:border-red-400 data-[invalid=true]:ring-red-100"
        )}
      >
        <span className="text-[var(--muted)] shrink-0">{icon}</span>
        {display ? (
          <span className="truncate">{display}</span>
        ) : (
          <span className="truncate text-[var(--muted-2)]">{placeholder}</span>
        )}
      </button>
    </PopoverTrigger>
  )
}

interface DatePickerProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  minDate?: string
  invalid?: boolean
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "选择日期",
  minDate,
  invalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDateStr(value)
  const min = parseDateStr(minDate)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PickerTrigger
        id={id}
        invalid={invalid}
        placeholder={placeholder}
        display={value || undefined}
        icon={<CalendarDays size={14} strokeWidth={2} />}
      />
      <PopoverContent className="w-auto p-3">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? min}
          disabled={min ? { before: min } : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(toDateStr(date))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  minDate?: string
  invalid?: boolean
}

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "选择日期时间",
  minDate,
  invalid,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [datePart = "", timePart = ""] = (value ?? "").split("T")
  const selected = parseDateStr(datePart)
  const min = parseDateStr(minDate?.slice(0, 10))
  const display = value ? `${datePart} ${timePart}` : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PickerTrigger
        id={id}
        invalid={invalid}
        placeholder={placeholder}
        display={display}
        icon={<CalendarDays size={14} strokeWidth={2} />}
      />
      <PopoverContent className="w-auto p-3">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected ?? min}
          disabled={min ? { before: min } : undefined}
          onSelect={(date) => {
            if (date) onChange(`${toDateStr(date)}T${timePart || "00:00"}`)
          }}
        />
        <div className="mt-2 flex items-center gap-2 border-t border-[var(--line)] pt-3">
          <Clock size={14} strokeWidth={2} className="text-[var(--muted)] shrink-0" />
          <Input
            type="time"
            className="h-8"
            value={timePart}
            onChange={(e) => {
              const time = e.target.value
              if (!time) return
              onChange(`${datePart || toDateStr(new Date())}T${time}`)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
