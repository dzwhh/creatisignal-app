"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BarChart3, Calendar, Check, ChevronDown, ClipboardCheck, Megaphone, Rocket, Sparkles } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { AccountPicker } from "./account-picker"
import { DATE_RANGE_LABEL, type DateRange } from "@/lib/insights/types"
import {
  BASE_DELIVERY_DRAFTS,
  BusinessOverview,
  CreativeDecision,
  DeliveryCenter,
  INITIAL_CLOSED_LOOP_TASKS,
  TaskCenter,
} from "./decision/decision-pages"
import type { ClosedLoopTask, DeliveryIntent } from "@/lib/insights/decision-mock"
import { DECISION_STATUS_META } from "@/lib/insights/decision-mock"

// ─── Ad product (广告产品) ──────────────────────────────────────────────────
type AdProductId = "gmv_max" | "standard"

type AdProduct = {
  id: AdProductId
  label: string
  desc: string
}

const AD_PRODUCTS: AdProduct[] = [
  {
    id: "gmv_max",
    label: "GMV Max",
    desc: "监测商品 × 素材在 GMV Max 自动投放中的 GMV 贡献",
  },
  {
    id: "standard",
    label: "标准竞价广告",
    desc: "适用于普通 TikTok Ads、Spark Ads、Website Conversion、Traffic 等场景",
  },
]

type Tab = "overview" | "creative" | "delivery" | "tasks"

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: "overview", label: "经营总览", icon: BarChart3 },
  { id: "creative", label: "素材诊断", icon: Sparkles },
  { id: "delivery", label: "投放中心", icon: Rocket },
  { id: "tasks", label: "任务记录", icon: ClipboardCheck },
]

export function InsightsShell({ initialTab = "overview" }: { initialTab?: Tab } = {}) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [adProduct, setAdProduct] = useState<AdProduct>(AD_PRODUCTS[0])
  const [shop, setShop] = useState<Shop>(SHOPS[0])
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [creativeProductId, setCreativeProductId] = useState<string | null>(null)
  const [deliveryProductId, setDeliveryProductId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<DeliveryIntent[]>(BASE_DELIVERY_DRAFTS)
  const [tasks, setTasks] = useState<ClosedLoopTask[]>(INITIAL_CLOSED_LOOP_TASKS)
  // Default = all active accounts (≠ paused); empty Set means "all"
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(() => new Set())

  /** 带商品上下文进入素材诊断；传 "all" 表示不带筛选 */
  const openCreative = (productId: string) => {
    setCreativeProductId(productId === "all" ? null : productId)
    setTab("creative")
  }

  /** 非素材问题走投放中心：只复核目标 ROAS（TikTok Target ROI）与商品 Offer，不给素材动作 */
  const openDelivery = (productId: string) => {
    setDeliveryProductId(productId)
    setTab("delivery")
  }

  const createDelivery = (intent: DeliveryIntent) => {
    const selectedCount = intent.creatives.filter((item) => item.selected).length
    setDrafts((current) => [intent, ...current.filter((item) => item.id !== intent.id)])
    setTasks((current) => [{
      id: `task-${intent.id}`,
      title: intent.title,
      productName: intent.title.split("｜")[0],
      source: DECISION_STATUS_META[intent.sourceStatus].label,
      stage: "ready",
      progress: 100,
      result: `${selectedCount} 条素材已准备，等待发布`,
      updatedAt: "刚刚",
      timeline: [
        { time: "刚刚", label: "诊断命中并生成素材", detail: `来源素材 ${intent.sourceCreativeId}`, state: "done" },
        { time: "刚刚", label: "写入待发布方案", detail: `目标 ROAS ${intent.targetRoi.toFixed(2)} · 日预算 $${intent.dailyBudget}`, state: "done" },
        { time: "—", label: "等待投放确认", detail: `首轮观察 ${intent.observationHours} 小时 · 判赢 ${intent.winOrders} 单`, state: "current" },
        { time: "—", label: "结果回流", detail: "同口径比较原素材与变体后更新诊断", state: "todo" },
      ],
    }, ...current.filter((item) => item.id !== `task-${intent.id}`)])
    setDeliveryProductId(null)
    setTab("delivery")
  }

  const publishDelivery = (intent: DeliveryIntent) => {
    setDrafts((current) => current.filter((item) => item.id !== intent.id))
    setTasks((current) => [{
      id: `published-${intent.id}`,
      title: intent.title,
      productName: intent.title.split("｜")[0],
      source: "投放发布",
      stage: "observing",
      progress: 18,
      result: `已发布，首轮观察 ${intent.observationHours} 小时`,
      updatedAt: "刚刚",
      timeline: [
        { time: "刚刚", label: "确认并发布", detail: `${intent.creatives.filter((item) => item.selected).length} 条素材加入 GMV Max 素材池`, state: "done" },
        { time: "刚刚", label: `首轮观察 ${intent.observationHours} 小时`, detail: `判赢 ROI ≥ ${intent.targetRoi.toFixed(2)} 且订单 ≥ ${intent.winOrders}`, state: "current" },
        { time: "—", label: "结果回流", detail: `连续两个窗口低于止损 ROI ${intent.stopRoi.toFixed(2)} 时提醒调整`, state: "todo" },
      ],
    }, ...current])
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top toolbar */}
      <div className="px-8 pt-6 pb-3 border-b border-[var(--line)] bg-white">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight leading-tight">
              GMV Max 素材诊断
            </h1>
            <p className="text-[12.5px] text-[var(--muted)] mt-1">
              从经营波动定位到素材动作，再完成投放与结果回收
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AdProductSwitcher value={adProduct} onChange={setAdProduct} />
            {adProduct.id === "gmv_max" && <ShopSwitcher value={shop} onChange={setShop} />}
            <AccountPicker selected={selectedAccounts} onChange={setSelectedAccounts} />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} className="min-h-full">
            {tab === "overview" && <BusinessOverview onOpenCreative={openCreative} onOpenDelivery={openDelivery} />}
            {tab === "creative" && (
              <CreativeDecision productId={creativeProductId} onCreateDelivery={createDelivery} onOpenDelivery={openDelivery} />
            )}
            {tab === "delivery" && (
              <DeliveryCenter
                drafts={drafts}
                focusProductId={deliveryProductId}
                onPublish={publishDelivery}
                onOpenCreative={openCreative}
              />
            )}
            {tab === "tasks" && <TaskCenter tasks={tasks} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

// ─── Ad product switcher (广告产品) ────────────────────────────────────────

function AdProductSwitcher({ value, onChange }: { value: AdProduct; onChange: (p: AdProduct) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] transition-colors data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <Megaphone size={13} strokeWidth={2.2} className="text-[var(--muted)]" />
          {value.label}
          <ChevronDown size={12} className="text-[var(--muted)] -mr-0.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[320px] p-1.5 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <p className="px-2.5 pt-1 pb-1.5 text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
            广告产品
          </p>
          {AD_PRODUCTS.map((p) => {
            const active = p.id === value.id
            return (
              <Popover.Close key={p.id} asChild>
                <button
                  type="button"
                  onClick={() => onChange(p)}
                  className={cn(
                    "w-full px-2.5 py-2 rounded-[9px] flex items-start gap-2 cursor-pointer text-left transition-colors",
                    active ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-extrabold text-[var(--text)]">{p.label}</p>
                    <p className="text-[10.5px] text-[var(--muted)] leading-relaxed mt-0.5">{p.desc}</p>
                  </div>
                  {active && <Check size={12} strokeWidth={2.6} className="text-[var(--text)] shrink-0 mt-1" />}
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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

export type { Tab as InsightsTab }
