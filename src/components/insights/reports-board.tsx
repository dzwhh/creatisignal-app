"use client"

import { useMemo, useState } from "react"
import { ChevronRight, ChevronDown, FileText, Folder, FolderPlus, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReportsStore } from "@/lib/insights/reports-store"

export function ReportsBoard() {
  const { folders, reports, addFolder } = useReportsStore()
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set(folders.map((f) => f.id)))

  function toggleFolder(id: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function saveFolder() {
    const v = newFolderName.trim()
    if (!v) {
      setCreatingFolder(false)
      return
    }
    const f = addFolder(v)
    setExpandedFolders((prev) => new Set([...prev, f.id]))
    setNewFolderName("")
    setCreatingFolder(false)
  }

  const visibleReports = useMemo(() => {
    if (!searchQuery.trim()) return reports
    const q = searchQuery.toLowerCase()
    return reports.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q)
    )
  }, [reports, searchQuery])

  const rootReports = visibleReports.filter((r) => !r.folderId)

  return (
    <div className="mt-3 pt-3 border-t border-[var(--line)]">
      {/* Header row */}
      <div className="group flex items-center gap-1 px-2 mb-1 h-7">
        <span className="text-[11.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide flex-1">
          Report
        </span>
        <button
          type="button"
          title="创建文件夹"
          onClick={() => { setCreatingFolder(true); setSearchOpen(false) }}
          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted-2)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FolderPlus size={12} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          title="搜索报表"
          onClick={() => { setSearchOpen((v) => !v); setCreatingFolder(false) }}
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted-2)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer transition-opacity",
            searchOpen ? "opacity-100 bg-[var(--soft)] text-[var(--text)]" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Search size={12} strokeWidth={2.2} />
        </button>
      </div>

      {/* Create folder input */}
      {creatingFolder && (
        <div className="px-2 mb-1.5">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveFolder()
              else if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName("") }
            }}
            onBlur={saveFolder}
            placeholder="文件夹名称…"
            className="w-full h-7 px-2 rounded-md border border-[var(--line-strong)] bg-white text-[11.5px] font-semibold text-[var(--text)] outline-none focus:border-[var(--text)]"
          />
        </div>
      )}

      {/* Search input */}
      {searchOpen && (
        <div className="px-2 mb-1.5 relative">
          <Search size={11} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-2)] pointer-events-none" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索报表…"
            className="w-full h-7 pl-6 pr-6 rounded-md border border-[var(--line)] bg-white text-[11.5px] font-semibold text-[var(--text)] outline-none focus:border-[var(--line-strong)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)] hover:text-[var(--text)] cursor-pointer"
              title="清空"
            >
              <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* Tree */}
      <ul className="space-y-0.5">
        {folders.map((f) => {
          const inFolder = visibleReports.filter((r) => r.folderId === f.id)
          const isExpanded = expandedFolders.has(f.id)
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => toggleFolder(f.id)}
                className="w-full h-7 px-2 rounded-md flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={11} className="text-[var(--muted)] shrink-0" />
                ) : (
                  <ChevronRight size={11} className="text-[var(--muted)] shrink-0" />
                )}
                <Folder size={12} className="text-[var(--muted)] shrink-0" />
                <span className="truncate flex-1 text-left">{f.name}</span>
                {inFolder.length > 0 && (
                  <span className="text-[10px] font-bold text-[var(--muted-2)] tabular-nums">{inFolder.length}</span>
                )}
              </button>
              {isExpanded && inFolder.length > 0 && (
                <ul className="ml-6 mt-0.5 space-y-0.5">
                  {inFolder.map((r) => (
                    <ReportLeaf key={r.id} name={r.name} />
                  ))}
                </ul>
              )}
            </li>
          )
        })}

        {/* Root-level (no folder) reports */}
        {rootReports.map((r) => (
          <li key={r.id} className="pl-2">
            <ReportLeaf name={r.name} />
          </li>
        ))}

        {/* Empty state */}
        {folders.length === 0 && rootReports.length === 0 && (
          <li className="px-2 py-3 text-[11px] text-[var(--muted-2)] leading-relaxed">
            {searchQuery
              ? "没有匹配的报表"
              : "通过「自定义报表 → Auto Report」创建第一份报表"}
          </li>
        )}
      </ul>
    </div>
  )
}

function ReportLeaf({ name }: { name: string }) {
  return (
    <button
      type="button"
      className="w-full h-7 px-2 rounded-md flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer transition-colors"
    >
      <FileText size={11} className="text-[var(--muted-2)] shrink-0" />
      <span className="truncate flex-1 text-left">{name}</span>
    </button>
  )
}
