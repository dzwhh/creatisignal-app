"use client"

import { Hash, Rocket } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockAccounts } from "@/lib/ads/gmv-max-mock"
import { FieldError, SectionCard, type SectionProps } from "./section-card"

// ─── 投放设置：优化目标（固定）/ ROAS 出价 / 每日预算 ────────────────────────

// 数字输入过滤：ROAS 允许 1 位小数，预算仅整数；非法字符直接丢弃
const sanitizeRoas = (v: string) => {
  const cleaned = v.replace(/[^\d.]/g, "")
  const m = cleaned.match(/^\d*(\.\d?)?/)
  return m ? m[0] : ""
}
const sanitizeBudget = (v: string) => v.replace(/\D/g, "")

// 数字输入框：左侧 # 标识表示仅可填数字
function NumberInput(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Hash
        size={13}
        strokeWidth={2}
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)] pointer-events-none"
      />
      <Input {...props} className="pl-8" />
    </div>
  )
}

export function DeliverySettings({ config, update, errors }: SectionProps) {
  const currency = mockAccounts.find((a) => a.id === config.accountId)?.currency

  return (
    <SectionCard id="section-delivery" icon={Rocket} title="投放设置" desc="预算出价与竞价策略">
      <div className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-4 py-3 text-[13px] text-[var(--muted)] flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>
          优化目标：<span className="font-semibold text-[var(--text)]">GMV / 总收入（VALUE）</span>
        </span>
        <span className="text-[var(--line-strong)]">｜</span>
        <span>
          竞价策略：<span className="font-semibold text-[var(--text)]">最小 ROAS 出价（VO_MIN_ROAS）</span>
        </span>
      </div>

      <div className="grid grid-cols-1 @xl:grid-cols-2 gap-4">
        <div>
          <Label required htmlFor="gmv-roas">ROAS 出价</Label>
          <div className="mt-2">
            <NumberInput
              id="gmv-roas"
              inputMode="decimal"
              placeholder="例如：2.5"
              aria-invalid={!!errors.roasBid}
              value={config.roasBid}
              onChange={(e) => update("roasBid", sanitizeRoas(e.target.value))}
            />
          </div>
          {errors.roasBid ? (
            <FieldError message={errors.roasBid} />
          ) : (
            <p className="mt-1.5 text-xs text-[var(--muted-2)]">目标 ROAS 最低值，精确到 1 位小数</p>
          )}
        </div>
        <div>
          <Label required htmlFor="gmv-budget">每日预算</Label>
          <div className="mt-2">
            <NumberInput
              id="gmv-budget"
              inputMode="numeric"
              placeholder="例如：1000"
              aria-invalid={!!errors.dailyBudget}
              value={config.dailyBudget}
              onChange={(e) => update("dailyBudget", sanitizeBudget(e.target.value))}
            />
          </div>
          {errors.dailyBudget ? (
            <FieldError message={errors.dailyBudget} />
          ) : (
            <p className="mt-1.5 text-xs text-[var(--muted-2)]">
              单位：{currency ? `${currency}（账户货币）` : "广告账户对应货币"}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
