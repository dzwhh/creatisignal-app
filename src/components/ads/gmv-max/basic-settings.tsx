"use client"

import { useMemo } from "react"
import { Radio, Zap } from "lucide-react"
import { Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAccounts } from "@/lib/ads/gmv-max-mock"
import { PLAN_NAME_MAX, planNamePrefix } from "@/lib/ads/gmv-max-types"
import { ChoiceCard, FieldError, SectionCard, ToggleRow, type SectionProps } from "./section-card"

// ─── 基础设置：广告账户 / 推广类型 / 启用开关 / 计划名称 ─────────────────────

export function BasicSettings({ config, update, errors }: SectionProps) {
  const prefix = useMemo(() => planNamePrefix(), [])

  return (
    <SectionCard id="section-basic" icon={Settings} title="基础设置" desc="推广计划名称、广告账户与推广类型">
      <div>
        <Label required htmlFor="gmv-account">广告账户</Label>
        <div className="mt-2">
          <Select value={config.accountId} onValueChange={(v) => update("accountId", v)}>
            <SelectTrigger id="gmv-account" aria-invalid={!!errors.accountId}>
              <SelectValue placeholder="请选择广告账户" />
            </SelectTrigger>
            <SelectContent>
              {mockAccounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}（{acc.advertiserId}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FieldError message={errors.accountId} />
      </div>

      <div>
        <Label>推广类型</Label>
        <div className="mt-2 grid grid-cols-1 @xl:grid-cols-2 gap-3">
          <ChoiceCard
            icon={Zap}
            title="商品 GMV Max"
            desc="推广商品，提升商品销量"
            selected={config.promotionType === "product"}
            onClick={() => update("promotionType", "product")}
          />
          <ChoiceCard
            icon={Radio}
            title="直播 GMV Max"
            desc="推广直播间，提升直播 GMV"
            selected={false}
            disabled
            badge="即将上线"
          />
        </div>
      </div>

      <ToggleRow
        title="创建后启用广告"
        desc="广告创建后处于暂停状态，需手动启用"
        checked={config.enableOnCreate}
        onCheckedChange={(v) => update("enableOnCreate", v)}
      />

      <div>
        <Label htmlFor="gmv-plan-name">计划名称</Label>
        <div className="mt-2 flex items-center">
          <span className="h-9 flex items-center px-3 rounded-l-md border border-r-0 border-[var(--line)] bg-[var(--soft)] text-sm text-[var(--muted)] font-mono shrink-0">
            {prefix}
          </span>
          <Input
            id="gmv-plan-name"
            className="rounded-l-none"
            placeholder="可选，留空则仅使用日期前缀"
            maxLength={PLAN_NAME_MAX}
            value={config.planName}
            onChange={(e) => update("planName", e.target.value)}
          />
        </div>
        <p className="mt-1.5 text-xs text-[var(--muted-2)] text-right">
          {prefix.length + config.planName.length} / {PLAN_NAME_MAX}
        </p>
      </div>
    </SectionCard>
  )
}
