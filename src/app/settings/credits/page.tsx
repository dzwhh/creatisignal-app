"use client"

import { useState } from "react"
import { Calendar, Check, Coins, Gift, ScrollText, ShoppingBag, Sparkles, TrendingUp } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { cn } from "@/lib/utils"

type DailyTask = {
  id: string
  label: string
  reward: number
  done: boolean
}

const INITIAL_DAILY: DailyTask[] = [
  { id: "sign", label: "每日签到",          reward: 20, done: true },
  { id: "task", label: "完成 1 个 AI 任务", reward: 30, done: true },
  { id: "invite", label: "邀请 1 位新好友",  reward: 100, done: false },
  { id: "replicate", label: "完成首次爆款复刻", reward: 50, done: false },
]

type ShopItem = {
  id: string
  title: string
  desc: string
  cost: number
  badge?: string
}

const SHOP: ShopItem[] = [
  { id: "pro_trial",  title: "Pro 1 天试用",   desc: "解锁全部高级模型 24h", cost: 100, badge: "热门" },
  { id: "tmpl_pro",   title: "高级模板 ×1",     desc: "解锁 1 个 Pro 模板",  cost: 50 },
  { id: "lottery",    title: "抽奖券 ×1",       desc: "周末大转盘抽奖",      cost: 20 },
  { id: "model_seed", title: "Seedance Pro 单次", desc: "高级视频模型试用",   cost: 80 },
  { id: "rush",       title: "优先生成队列",     desc: "下次任务 ≤ 30s 出结果", cost: 60 },
  { id: "boost",      title: "今日 +50% 积分",   desc: "今日所有任务奖励 ×1.5", cost: 40, badge: "限时" },
]

type LedgerEntry = {
  ts: string
  type: "earn" | "spend"
  source: string
  delta: number
}

const LEDGER: LedgerEntry[] = [
  { ts: "今天 10:24",   type: "earn",  source: "完成 AI 任务", delta: 30  },
  { ts: "今天 09:18",   type: "earn",  source: "每日签到",     delta: 20  },
  { ts: "昨天 22:01",   type: "spend", source: "兑换 高级模板", delta: -50 },
  { ts: "昨天 17:42",   type: "spend", source: "Seedance Pro 单次", delta: -80 },
  { ts: "昨天 12:09",   type: "earn",  source: "邀请好友 jane.t",  delta: 100 },
  { ts: "06-17 19:30",  type: "earn",  source: "完成 AI 任务", delta: 30  },
  { ts: "06-17 11:05",  type: "spend", source: "兑换 Pro 试用 1 天", delta: -100 },
  { ts: "06-16 23:12",  type: "earn",  source: "活动奖励 月度任务",  delta: 200 },
  { ts: "06-15 15:48",  type: "earn",  source: "完成 AI 任务", delta: 30  },
  { ts: "06-15 09:00",  type: "earn",  source: "每日签到",     delta: 20  },
]

export default function CreditsPage() {
  const [daily, setDaily] = useState(INITIAL_DAILY)
  const claimableCount = daily.filter((d) => d.done).length

  return (
    <>
      <Topbar title="积分" />
      <SettingsShell title="积分" subtitle="完成日常任务赚积分，用积分解锁高级模型 / 模板。">
        {/* 余额大卡 */}
        <SettingsCard icon={Coins} title="当前余额">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-[42px] font-extrabold text-[var(--text)] leading-none tabular-nums">
                12,480
                <span className="text-[14px] text-[var(--muted-2)] font-bold ml-2">积分</span>
              </p>
              <p className="text-[11.5px] text-[var(--muted)] mt-2 flex items-center gap-1.5">
                <TrendingUp size={11} className="text-[#16a34a]" />
                上月 <span className="font-extrabold text-[#16a34a]">+1,240 (+11%)</span> · 等效约 <span className="font-extrabold text-[var(--text)]">$12.5</span>
              </p>
            </div>
            <div className="rounded-xl bg-[var(--lime-soft)] border border-[#cdf066] px-4 py-3 flex items-center gap-2.5 text-[#3a4b1f]">
              <Sparkles size={14} className="text-[#5a7821]" />
              <div>
                <p className="text-[11px] font-bold">本周可领</p>
                <p className="text-[15px] font-extrabold leading-none mt-0.5">+{claimableCount * 50} 积分</p>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* 每日任务 */}
        <SettingsCard icon={Calendar} title="每日任务" description="每日 0:00 重置，完成即可领取积分。">
          <ul className="divide-y divide-[var(--line)]">
            {daily.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setDaily((prev) => prev.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                  className={cn(
                    "w-5 h-5 rounded-md shrink-0 flex items-center justify-center cursor-pointer transition-colors",
                    t.done ? "bg-[var(--text)] text-white" : "border border-[var(--line-strong)] bg-white hover:border-[var(--text)]"
                  )}
                  aria-label="切换完成状态"
                >
                  {t.done && <Check size={12} strokeWidth={3} />}
                </button>
                <p className={cn("flex-1 text-[12.5px] font-bold", t.done ? "text-[var(--muted)] line-through" : "text-[var(--text)]")}>
                  {t.label}
                </p>
                <span className={cn(
                  "inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-extrabold",
                  t.done ? "bg-[#dcfce7] text-[#15803d]" : "bg-[var(--soft)] text-[var(--muted)]"
                )}>
                  +{t.reward} 积分
                </span>
              </li>
            ))}
          </ul>
        </SettingsCard>

        {/* 兑换商城 */}
        <SettingsCard icon={ShoppingBag} title="兑换商城" description="用积分兑换模板、模型与权益。">
          <div className="grid grid-cols-3 gap-3">
            {SHOP.map((s) => (
              <article key={s.id} className="rounded-xl border border-[var(--line)] bg-white p-3 flex flex-col gap-2 relative">
                {s.badge && (
                  <span className="absolute -top-2 left-3 inline-flex h-5 px-1.5 rounded-md bg-[#fff7ed] text-[#9a3412] text-[10px] font-extrabold border border-[#fed7aa]">
                    {s.badge}
                  </span>
                )}
                <div className="w-9 h-9 rounded-lg bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center">
                  <Gift size={14} strokeWidth={2.4} />
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-extrabold text-[var(--text)] leading-tight">{s.title}</p>
                  <p className="text-[10.5px] text-[var(--muted)] mt-1 leading-relaxed">{s.desc}</p>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-[var(--line)]">
                  <span className="text-[11.5px] font-extrabold text-[var(--text)] flex items-center gap-1">
                    <Coins size={11} className="text-[#facc15]" />
                    {s.cost}
                  </span>
                  <button
                    type="button"
                    className="h-7 px-2.5 rounded-md bg-[#18181b] text-white text-[11px] font-extrabold cursor-pointer hover:opacity-90"
                  >
                    兑换
                  </button>
                </div>
              </article>
            ))}
          </div>
        </SettingsCard>

        {/* 明细 */}
        <SettingsCard icon={ScrollText} title="积分明细" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">时间</th>
                  <th className="text-left px-5 py-2.5">来源</th>
                  <th className="text-center px-5 py-2.5">类型</th>
                  <th className="text-right px-5 py-2.5">变动</th>
                </tr>
              </thead>
              <tbody>
                {LEDGER.map((l, i) => (
                  <tr key={i} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                    <td className="px-5 py-2.5 text-[var(--muted)]">{l.ts}</td>
                    <td className="px-5 py-2.5 text-[var(--text)] font-bold">{l.source}</td>
                    <td className="px-5 py-2.5 text-center">
                      <span className={cn(
                        "inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold",
                        l.type === "earn" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"
                      )}>
                        {l.type === "earn" ? "收入" : "支出"}
                      </span>
                    </td>
                    <td className={cn(
                      "px-5 py-2.5 text-right tabular-nums font-extrabold",
                      l.delta > 0 ? "text-[#15803d]" : "text-[#b91c1c]"
                    )}>
                      {l.delta > 0 ? "+" : ""}{l.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}
