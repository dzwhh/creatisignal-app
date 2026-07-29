"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { zhCN } from "react-day-picker/locale"
import { cn } from "@/lib/utils"

// shadcn 风格日历：react-day-picker + 项目主题 token，中文本地化
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={zhCN}
      showOutsideDays={showOutsideDays}
      className={cn("select-none", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium text-[var(--text)]",
        nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
        button_previous:
          "flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors duration-150 cursor-pointer hover:bg-[var(--soft)] hover:text-[var(--text)] disabled:opacity-30 disabled:pointer-events-none",
        button_next:
          "flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition-colors duration-150 cursor-pointer hover:bg-[var(--soft)] hover:text-[var(--text)] disabled:opacity-30 disabled:pointer-events-none",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "flex h-8 w-8 items-center justify-center text-xs font-normal text-[var(--muted-2)]",
        week: "mt-0.5 flex",
        day: "relative p-0 text-center",
        day_button:
          "flex h-8 w-8 items-center justify-center rounded-md text-[13px] text-[var(--text)] transition-colors duration-150 cursor-pointer hover:bg-[var(--soft)]",
        today: "[&>button]:font-semibold [&>button]:bg-[var(--lime-soft)]",
        selected:
          "[&>button]:bg-[var(--near-black)]! [&>button]:text-white! [&>button]:font-medium",
        outside: "[&>button]:text-[var(--muted-2)] [&>button]:opacity-60",
        disabled: "[&>button]:opacity-30 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === "left" ? (
            <ChevronLeft size={16} strokeWidth={2} className={chevronClassName} />
          ) : (
            <ChevronRight size={16} strokeWidth={2} className={chevronClassName} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
