"use client"

import { useMemo, useState } from "react"
import { Search, Pencil, Plus, Trash2, X, Check } from "lucide-react"
import { ACCOUNTS, ACCOUNT_GROUPS } from "@/lib/insights/mock"
import { STATUS_META, type Account, type AccountStatus, type AccountGroup } from "@/lib/insights/types"
import { StatusBadge } from "../shared"

export function AccountManagePage() {
  const [aliasMap, setAliasMap] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "all">("all")
  const [groups, setGroups] = useState<AccountGroup[]>(ACCOUNT_GROUPS.filter((g) => g.type === "user"))
  const [groupCreator, setGroupCreator] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")

  const filtered = useMemo(() => {
    let list = [...ACCOUNTS]
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (aliasMap[a.id] ?? "").toLowerCase().includes(q)
      )
    }
    return list
  }, [query, statusFilter, aliasMap])

  function startEdit(a: Account) {
    setEditingId(a.id)
    setDraft(aliasMap[a.id] ?? "")
  }
  function saveEdit() {
    if (!editingId) return
    setAliasMap({ ...aliasMap, [editingId]: draft.trim() })
    setEditingId(null)
    setDraft("")
  }

  return (
    <div className="px-8 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-[var(--text)] tracking-tight">账户管理</h2>
          <p className="text-[12.5px] text-[var(--muted)] mt-1">编辑账户别名 · 管理保存的账户分组 · {ACCOUNTS.length} 个账户</p>
        </div>
      </div>

      {/* Saved groups */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-extrabold text-[var(--text)]">已保存分组</h3>
          {!groupCreator ? (
            <button
              type="button"
              onClick={() => setGroupCreator(true)}
              className="h-8 px-3 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[12.5px] font-bold flex items-center gap-1 cursor-pointer hover:bg-[var(--soft-2)]"
            >
              <Plus size={12} /> 新建分组
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="分组名"
                className="h-8 px-2 rounded-md border border-[var(--line)] text-[12.5px] outline-none focus:border-[var(--line-strong)]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newGroupName.trim()) {
                    setGroups([...groups, { id: `g_user_${Date.now()}`, name: newGroupName.trim(), type: "user", accountIds: [], emoji: "📂" }])
                    setNewGroupName("")
                    setGroupCreator(false)
                  }
                }}
                className="h-8 px-3 rounded-md bg-[#18181b] text-white text-[11.5px] font-bold cursor-pointer hover:opacity-90"
              >
                创建
              </button>
              <button type="button" onClick={() => { setGroupCreator(false); setNewGroupName("") }} className="h-8 w-8 rounded-md hover:bg-[var(--soft)] flex items-center justify-center text-[var(--muted)] cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {groups.map((g) => (
            <div key={g.id} className="rounded-lg border border-[var(--line)] bg-[var(--soft-2)] px-3 py-2 flex items-center justify-between">
              <div className="min-w-0 flex items-center gap-2">
                <span>{g.emoji}</span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-[var(--text)] truncate">{g.name}</p>
                  <p className="text-[10.5px] text-[var(--muted)]">{g.accountIds.length} 个账户</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGroups(groups.filter((x) => x.id !== g.id))}
                className="w-7 h-7 rounded-md text-[var(--muted)] hover:text-[#dc2626] hover:bg-white cursor-pointer flex items-center justify-center"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Account aliases */}
      <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-extrabold text-[var(--text)]">账户别名</h3>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AccountStatus | "all")}
              className="h-8 px-2 rounded-md border border-[var(--line)] bg-white text-[12px] outline-none cursor-pointer"
            >
              <option value="all">全部状态</option>
              {(["scaling", "learning", "rewrite", "warming", "paused"] as AccountStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索..."
                className="h-8 pl-7 pr-2 rounded-md border border-[var(--line)] bg-white text-[12px] w-[180px] outline-none focus:border-[var(--line-strong)]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[var(--soft-2)] border-y border-[var(--line)]">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">账户名 / ID</th>
                <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">状态</th>
                <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">区域</th>
                <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">别名</th>
                <th className="w-16 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((a) => {
                const alias = aliasMap[a.id]
                const editing = editingId === a.id
                return (
                  <tr key={a.id} className="border-t border-[var(--line)] hover:bg-[var(--soft-2)]">
                    <td className="px-3 py-2">
                      <p className="text-[12.5px] font-semibold text-[var(--text)] truncate">{a.name}</p>
                      <p className="text-[10.5px] text-[var(--muted)] font-mono">{a.id}</p>
                    </td>
                    <td className="px-3 py-2"><StatusBadge status={a.status} compact /></td>
                    <td className="px-3 py-2 text-[11.5px] text-[var(--muted)] font-semibold">{a.region} · {a.tier}</td>
                    <td className="px-3 py-2">
                      {editing ? (
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditingId(null); setDraft("") } }}
                          autoFocus
                          className="h-7 px-2 rounded-md border border-[var(--line-strong)] text-[12.5px] outline-none w-full max-w-[200px]"
                          placeholder="例如：US 主账户"
                        />
                      ) : (
                        <span className="text-[12.5px] text-[var(--text)]">{alias || <span className="text-[var(--muted-2)] italic">未设置</span>}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editing ? (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={saveEdit} className="w-7 h-7 rounded-md bg-[#18181b] text-white hover:opacity-90 flex items-center justify-center cursor-pointer">
                            <Check size={13} />
                          </button>
                          <button type="button" onClick={() => { setEditingId(null); setDraft("") }} className="w-7 h-7 rounded-md hover:bg-[var(--soft)] text-[var(--muted)] flex items-center justify-center cursor-pointer">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => startEdit(a)} className="w-7 h-7 rounded-md hover:bg-[var(--soft)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer">
                          <Pencil size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 80 && (
          <div className="border-t border-[var(--line)] py-2 text-center text-[11.5px] text-[var(--muted)]">显示前 80 个，共 {filtered.length} 个</div>
        )}
      </section>
    </div>
  )
}
