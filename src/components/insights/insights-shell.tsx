"use client"

import { useMemo, useState } from "react"
import { Calendar, Check, ChevronDown, LayoutDashboard, Stethoscope, FileText, FlaskConical, Settings2 } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { AccountPicker } from "./account-picker"
import { ACCOUNTS } from "@/lib/insights/mock"
import { DATE_RANGE_LABEL, type DateRange, type ViewMode } from "@/lib/insights/types"
import { OverviewPage } from "./pages/overview-page"
import { DiagnosePage } from "./pages/diagnose-page"
import { ReportPage } from "./pages/report-page"
import { ExperimentPage } from "./pages/experiment-page"
import { AccountManagePage } from "./pages/account-manage-page"

type Tab = "overview" | "diagnose" | "report" | "experiment" | "accounts"

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "overview",   label: "概览",       icon: LayoutDashboard },
  { id: "diagnose",   label: "素材诊断",   icon: Stethoscope },
  { id: "report",     label: "洞察报告",   icon: FileText },
  { id: "experiment", label: "实验追踪",   icon: FlaskConical },
  { id: "accounts",   label: "账户管理",   icon: Settings2 },
]

export function InsightsShell() {
  const [tab, setTab] = useState<Tab>("overview")
  const [shop, setShop] = useState<Shop>(SHOPS[0])
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [view, setView] = useState<ViewMode>("material")
  // Default = all active accounts (≠ paused); empty Set means "all"
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(() => new Set())

  const effectiveAccountIds = useMemo(() => {
    if (selectedAccounts.size === 0) {
      return ACCOUNTS.filter((a) => a.status !== "paused").map((a) => a.id)
    }
    return Array.from(selectedAccounts)
  }, [selectedAccounts])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top toolbar */}
      <div className="px-8 pt-6 pb-3 border-b border-[var(--line)] bg-white">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight leading-tight">
              素材增长诊断
            </h1>
            <p className="text-[12.5px] text-[var(--muted)] mt-1">
              诊断高 CPO 原因，生成下一轮素材 Brief
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ShopSwitcher value={shop} onChange={setShop} />
            <AccountPicker selected={selectedAccounts} onChange={setSelectedAccounts} />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            {tab === "diagnose" && <ViewSwitcher value={view} onChange={setView} />}
          </div>
        </div>

        {/* Sub-tab nav */}
        <div className="flex items-center gap-0 -mb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative h-10 px-3.5 flex items-center gap-1.5 text-[13.5px] font-bold cursor-pointer transition-colors",
                tab === id ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
              {tab === id && (
                <span className="absolute left-3 right-3 bottom-[-1px] h-[2px] rounded-full bg-[var(--text)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Page body */}
      <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
        {tab === "overview" && (
          <OverviewPage accountIds={effectiveAccountIds} dateRange={dateRange} onJumpTab={(t) => setTab(t)} />
        )}
        {tab === "diagnose" && (
          <DiagnosePage accountIds={effectiveAccountIds} view={view} onChangeView={setView} />
        )}
        {tab === "report" && (
          <ReportPage accountIds={effectiveAccountIds} dateRange={dateRange} />
        )}
        {tab === "experiment" && <ExperimentPage />}
        {tab === "accounts" && <AccountManagePage />}
      </main>
    </div>
  )
}

// ─── Shop switcher ───────────────────────────────────────────────────────────

type Shop = {
  id: string
  name: string
  shopCode: string
  initial: string
  color: string    // 头像底色
}

const SHOPS: Shop[] = [
  { id: "hotligh",  name: "Hotligh",    shopCode: "HTLGHX001", initial: "H", color: "#fde68a" },
  { id: "skinmade", name: "SKINMADE",   shopCode: "MYLCX2WLAG", initial: "S", color: "#e0e7ff" },
  { id: "toolbox",  name: "ToolBox Pro", shopCode: "TBPRO-0421", initial: "T", color: "#bbf7d0" },
  { id: "outdoor",  name: "Outdoor Crew", shopCode: "OUTCREW9X", initial: "O", color: "#fed7aa" },
  { id: "anker",    name: "Anker Direct", shopCode: "ANKER-DRT-1", initial: "A", color: "#bae6fd" },
]

function ShopSwitcher({ value, onChange }: { value: Shop; onChange: (s: Shop) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] transition-colors data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <span
            className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center text-[#1a2010]"
            style={{ backgroundColor: value.color }}
          >
            {value.initial}
          </span>
          {value.name}
          <ChevronDown size={12} className="text-[var(--muted)] -mr-0.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[280px] p-1.5 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <p className="px-2.5 pt-1 pb-1.5 text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
            切换店铺
          </p>
          {SHOPS.map((s) => {
            const active = s.id === value.id
            return (
              <Popover.Close key={s.id} asChild>
                <button
                  type="button"
                  onClick={() => onChange(s)}
                  className={cn(
                    "w-full px-2 py-2 rounded-[9px] flex items-center gap-2.5 cursor-pointer text-left transition-colors",
                    active ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                  )}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-extrabold text-[#1a2010] shrink-0"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.initial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-extrabold text-[var(--text)] truncate">{s.name}</p>
                    <p className="text-[10.5px] text-[var(--muted)] font-mono truncate mt-0.5">
                      Shop code: {s.shopCode}
                    </p>
                  </div>
                  {active && <Check size={12} strokeWidth={2.6} className="text-[var(--text)] shrink-0" />}
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Date range picker ───────────────────────────────────────────────────────

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] transition-colors data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <Calendar size={13} strokeWidth={2.2} className="text-[var(--muted)]" />
          {DATE_RANGE_LABEL[value]}
          <ChevronDown size={12} className="text-[var(--muted)] -mr-0.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[140px] p-1.5 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {(Object.keys(DATE_RANGE_LABEL) as DateRange[]).map((opt) => (
            <Popover.Close key={opt} asChild>
              <button
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  "w-full h-9 px-3 rounded-[9px] text-left text-[13px] cursor-pointer flex items-center transition-colors",
                  value === opt
                    ? "bg-[var(--soft)] text-[var(--text)] font-semibold"
                    : "text-[var(--muted)] hover:bg-[var(--soft-2)] hover:text-[var(--text)] font-medium"
                )}
              >
                {DATE_RANGE_LABEL[opt]}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── View switcher (素材 / 账户) ─────────────────────────────────────────────

function ViewSwitcher({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="h-9 p-0.5 rounded-full bg-[var(--soft)] flex items-center">
      {(["material", "account"] as ViewMode[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "h-8 px-3 rounded-full text-[12.5px] font-bold cursor-pointer transition-colors",
            value === v ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"
          )}
        >
          {v === "material" ? "素材视图" : "账户视图"}
        </button>
      ))}
    </div>
  )
}

export type { Tab as InsightsTab }
