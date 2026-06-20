"use client"

import { useEffect, useRef, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Check, ChevronDown, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"

type Project = {
  id: string
  name: string
  desc?: string
}

const PROJECTS: Project[] = [
  { id: "default",   name: "Default",       desc: "默认项目空间" },
  { id: "hotligh",   name: "Hotligh US",     desc: "工具户外 · 美区" },
  { id: "anker",     name: "Anker EU",       desc: "3C 数码 · 欧盟" },
  { id: "goop",      name: "Goop Lifestyle", desc: "美妆 · 全球" },
  { id: "outdoor",   name: "Outdoor Crew",   desc: "户外品类协作" },
]

function avatarColor(name: string): string {
  const palette = ["#c9ff29", "#bae6fd", "#fde68a", "#fecaca", "#ddd6fe", "#bbf7d0"]
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  return palette[h % palette.length]
}

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<Project>(PROJECTS[0])
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery("")
      window.setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const filtered = PROJECTS.filter((p) =>
    !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.desc?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex-1 min-w-0 h-9 flex items-center gap-[10px] px-2 rounded-md text-[#2b2e34] font-bold text-sm cursor-pointer hover:bg-[var(--soft)] data-[state=open]:bg-[var(--soft)]"
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-extrabold shrink-0 text-[#1a2010]"
            style={{ backgroundColor: avatarColor(active.name) }}
          >
            {active.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="flex-1 min-w-0 text-left truncate">{active.name}</span>
          <ChevronDown size={14} className="text-[var(--muted)] shrink-0" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[60] w-[260px] bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] overflow-hidden"
        >
          {/* 搜索 */}
          <div className="p-2 border-b border-[var(--line)]">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索项目空间..."
                className="w-full h-8 pl-7 pr-2 rounded-md border border-[var(--line)] bg-[var(--soft-2)] text-[12px] outline-none focus:border-[var(--text)]"
              />
            </div>
          </div>

          {/* 项目列表 */}
          <div className="max-h-[300px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-[11.5px] text-[var(--muted-2)] text-center py-3">没有匹配的项目</p>
            ) : (
              filtered.map((p) => {
                const isActive = p.id === active.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setActive(p); setOpen(false) }}
                    className={cn(
                      "w-full px-2 py-1.5 rounded-md flex items-center gap-2.5 cursor-pointer text-left transition-colors",
                      isActive ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                    )}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-extrabold shrink-0 text-[#1a2010]"
                      style={{ backgroundColor: avatarColor(p.name) }}
                    >
                      {p.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-extrabold text-[var(--text)] truncate">{p.name}</p>
                      {p.desc && <p className="text-[10.5px] text-[var(--muted)] mt-0.5 truncate">{p.desc}</p>}
                    </div>
                    {isActive && <Check size={12} strokeWidth={2.6} className="text-[var(--text)] shrink-0" />}
                  </button>
                )
              })
            )}
          </div>

          {/* 分割线 + 新增 */}
          <div className="border-t border-[var(--line)] p-1">
            <button
              type="button"
              className="w-full h-9 px-2 rounded-md flex items-center gap-2 cursor-pointer text-[var(--text)] hover:bg-[var(--soft-2)]"
            >
              <span className="w-7 h-7 rounded-lg border border-dashed border-[var(--line-strong)] flex items-center justify-center shrink-0">
                <Plus size={13} strokeWidth={2.4} className="text-[var(--muted)]" />
              </span>
              <span className="text-[12.5px] font-extrabold">新增项目空间</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
