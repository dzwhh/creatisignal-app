"use client"

import { useState } from "react"
import { Bot, History, MessageSquarePlus, Search } from "lucide-react"
import { PanelLeftClose } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentState } from "@/lib/agent/state"
import { useSidebarCollapsed } from "@/lib/layout/sidebar-state"
import { ProjectSwitcher } from "@/components/layout/project-switcher"
import { HoverList } from "@/components/layout/hover-list"

export function AgentSidebar() {
  const { state, selectThread, newThread } = useAgentState()
  const { toggle } = useSidebarCollapsed()
  const [query, setQuery] = useState("")

  const filtered = state.threads.filter((t) =>
    !query.trim() || t.title.toLowerCase().includes(query.toLowerCase()) || t.snippet.toLowerCase().includes(query.toLowerCase())
  )
  const activeIdx = state.activeThreadId
    ? filtered.findIndex((t) => t.id === state.activeThreadId)
    : -1

  return (
    <aside className="w-[260px] border-r border-[var(--line)] bg-[var(--panel)] p-[10px] shrink-0 flex flex-col">
      {/* 顶栏：项目切换 + 折叠 */}
      <div className="h-9 flex items-center gap-1 shrink-0">
        <ProjectSwitcher />
        <button
          type="button"
          onClick={toggle}
          aria-label="收起侧栏"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer shrink-0"
          title="收起侧栏"
        >
          <PanelLeftClose size={14} strokeWidth={2} />
        </button>
      </div>

      {/* 新建对话 */}
      <button
        type="button"
        onClick={newThread}
        className={cn(
          "mt-3 h-10 rounded-xl bg-[#18181b] text-white text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity shrink-0",
          state.activeThreadId === null && "ring-[3px] ring-[var(--lime)] ring-opacity-60"
        )}
      >
        <MessageSquarePlus size={13} strokeWidth={2.6} />
        新建对话
      </button>

      {/* Search */}
      <div className="mt-3 relative shrink-0">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索对话..."
          className="w-full h-8 pl-7 pr-2 rounded-md border border-[var(--line)] bg-white text-[12px] outline-none focus:border-[var(--text)]"
        />
      </div>

      {/* Section label */}
      <div className="mt-3 px-2 flex items-center gap-1.5 shrink-0">
        <History size={11} className="text-[var(--muted-2)]" />
        <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">最近对话</p>
        <span className="text-[10px] text-[var(--muted-2)] font-bold ml-auto">{state.threads.length}</span>
      </div>

      {/* Thread list */}
      <div className="mt-1 flex-1 overflow-y-auto -mx-1 px-1">
        {filtered.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <Bot size={18} className="text-[var(--muted-2)] mx-auto mb-1.5" />
            <p className="text-[11.5px] text-[var(--muted-2)]">还没有对话</p>
          </div>
        ) : (
          <HoverList activeIndex={activeIdx === -1 ? null : activeIdx} gap={2}>
            {filtered.map((t) => {
              const active = t.id === state.activeThreadId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectThread(t.id)}
                  className={cn(
                    "w-full px-2.5 py-2 rounded-lg text-left cursor-pointer transition-colors duration-200",
                    active ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] font-extrabold text-[var(--text)] truncate flex-1">{t.title}</p>
                    {t.status === "running" && (
                      <span className="inline-flex h-4 px-1 rounded-md bg-[#ede9fe] text-[#6d28d9] text-[9px] font-extrabold items-center shrink-0">
                        RUN
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-[var(--muted)] mt-0.5 truncate">{t.snippet}</p>
                  <p className="text-[9.5px] text-[var(--muted-2)] mt-0.5 font-bold">{relativeTime(t.createdAt)}</p>
                </button>
              )
            })}
          </HoverList>
        )}
      </div>
    </aside>
  )
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60000)
  if (min < 1) return "刚刚"
  if (min < 60) return `${min} 分钟前`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} 天前`
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
}
