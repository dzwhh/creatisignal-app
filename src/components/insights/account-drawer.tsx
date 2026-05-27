"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Settings2, Wallet, TrendingUp, Copy, AlertTriangle, Wand2, Pause, Power } from "lucide-react"
import { ActionBadge, MaterialThumb, MoneyShort, Sparkline, StatusBadge } from "./shared"
import { MATERIALS } from "@/lib/insights/mock"
import type { Account, Material } from "@/lib/insights/types"

export function AccountDrawer({ account, onClose }: { account: Account | null; onClose: () => void }) {
  return (
    <Dialog.Root open={account !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-[560px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2">
          {account && (
            <>
              <div className="px-6 pt-5 pb-4 border-b border-[var(--line)] flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Dialog.Title className="text-[18px] font-extrabold text-[var(--text)] truncate">{account.name}</Dialog.Title>
                    <StatusBadge status={account.status} compact />
                  </div>
                  <p className="text-[11.5px] text-[var(--muted)] font-mono truncate">{account.id} · {account.region} · {account.tier} · {account.channel}</p>
                </div>
                <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                  <X size={18} />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Account snapshot */}
                <div className="grid grid-cols-4 gap-2">
                  <Stat label="ROI 7d" value={account.metrics7d.roi.toFixed(2)} accent={account.metrics7d.roi >= account.roiTarget ? "ok" : "bad"} />
                  <Stat label="Target" value={account.roiTarget.toFixed(1)} />
                  <Stat label="CPO" value={account.metrics7d.cpo > 0 ? `$${account.metrics7d.cpo.toFixed(2)}` : "—"} />
                  <Stat label="订单" value={account.metrics7d.orders.toString()} />
                  <Stat label="花费" value={<MoneyShort value={account.metrics7d.spend} />} />
                  <Stat label="日预算" value={<MoneyShort value={account.dailyBudget} />} />
                  <Stat label="CTR" value={`${(account.metrics7d.ctr * 100).toFixed(2)}%`} />
                  <Stat label="点击" value={`${(account.metrics7d.clicks / 1000).toFixed(1)}K`} />
                </div>

                {/* Diagnosis box */}
                {account.diagnosis && (
                  <div className="rounded-xl border border-[#fde68a] bg-[#fffbea] p-3">
                    <p className="text-[11.5px] font-bold text-[#a16207] mb-1.5 flex items-center gap-1">
                      <AlertTriangle size={12} /> 账户级诊断
                    </p>
                    <p className="text-[12.5px] text-[var(--text)] leading-relaxed">{account.diagnosis}</p>
                    {account.suggestedTargetRoi !== undefined && (
                      <p className="mt-2 text-[12px] text-[var(--text)]">
                        建议 ROI Target: <span className="font-extrabold">{account.suggestedTargetRoi.toFixed(1)}</span>
                        （当前 <span className="font-bold">{account.roiTarget.toFixed(1)}</span>）
                      </p>
                    )}
                  </div>
                )}

                {/* Top materials */}
                <Section title="🏆 Top 5 素材">
                  <MaterialList fingerprints={account.topMaterialFingerprints} accountId={account.id} />
                </Section>

                {/* Bottom materials */}
                <Section title="⚠️ 低效素材">
                  <MaterialList fingerprints={account.bottomMaterialFingerprints} accountId={account.id} />
                </Section>

                {/* Actions */}
                <Section title="🛠️ 可执行操作">
                  <div className="grid grid-cols-2 gap-2">
                    <ActionButton icon={Settings2} label="下调 ROI Target" sub={account.suggestedTargetRoi ? `→ ${account.suggestedTargetRoi}` : ""} />
                    <ActionButton icon={Wallet} label="上调预算" sub="+ 20%" />
                    <ActionButton icon={Copy} label="复制 Top 素材到其他账户" />
                    <ActionButton icon={Wand2} label="为该账户生成 Brief" />
                    {account.status === "scaling" ? (
                      <ActionButton icon={TrendingUp} label="加入放量池" />
                    ) : (
                      <ActionButton icon={Power} label="启用账户" />
                    )}
                    <ActionButton icon={Pause} label="暂停账户" tone="bad" />
                  </div>
                </Section>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: "ok" | "warn" | "bad" }) {
  const tone: Record<string, string> = {
    ok:   "text-[#16a34a]",
    warn: "text-[#a16207]",
    bad:  "text-[#dc2626]",
  }
  const cls = accent ? tone[accent] : "text-[var(--text)]"
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--soft-2)] p-2.5">
      <p className="text-[10.5px] font-semibold text-[var(--muted)]">{label}</p>
      <p className={`text-[15px] font-extrabold ${cls}`}>{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-bold text-[var(--text)] mb-2">{title}</p>
      {children}
    </div>
  )
}

function MaterialList({ fingerprints, accountId }: { fingerprints: string[]; accountId: string }) {
  const mats = fingerprints.map((fp) => MATERIALS.find((m) => m.fingerprint === fp)).filter(Boolean) as Material[]
  if (mats.length === 0) return <p className="text-[11.5px] text-[var(--muted)]">暂无数据</p>
  return (
    <div className="space-y-1.5">
      {mats.map((m) => {
        const row = m.accountRows.find((r) => r.accountId === accountId)
        return (
          <div key={m.fingerprint} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-[var(--line)]">
            <MaterialThumb material={m} size={32} showPlay={false} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[var(--text)] truncate">{m.name}</p>
              <p className="text-[10.5px] text-[var(--muted)] font-mono truncate">
                ROI {row?.roi.toFixed(2)} · CPO ${row?.cpo.toFixed(2)} · ▣ {m.accountCount} 账户
              </p>
            </div>
            {row && <ActionBadge action={row.recommendation} />}
          </div>
        )
      })}
    </div>
  )
}

function ActionButton({ icon: Icon, label, sub, tone }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string; sub?: string; tone?: "bad" }) {
  const bgCls = tone === "bad" ? "hover:bg-[#fee2e2] text-[#dc2626] border-[#fee2e2]" : "hover:bg-[var(--soft-2)] text-[var(--text)] border-[var(--line)]"
  return (
    <button type="button" className={`h-10 px-3 rounded-lg border bg-white text-[12.5px] font-semibold flex items-center gap-2 cursor-pointer transition-colors ${bgCls}`}>
      <Icon size={13} strokeWidth={2} />
      <span className="flex-1 text-left truncate">{label}</span>
      {sub && <span className="text-[11px] text-[var(--muted)]">{sub}</span>}
    </button>
  )
}
