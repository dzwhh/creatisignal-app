"use client"

import { PreviewPanel } from "./preview-panel"
import { BasicSettings } from "./basic-settings"
import { ProductSettings } from "./product-settings"
import { DeliverySettings } from "./delivery-settings"
import { AdvancedOptimization } from "./advanced-optimization"
import { CreativeSettings } from "./creative-settings"
import { ScheduleSettings } from "./schedule-settings"
import type { SectionProps } from "./section-card"

// ─── 新建创编：左配置（弹性压缩）+ 右预览（恒定右侧 sticky）──────────────────

export function CreatePanel({ config, update, errors }: SectionProps) {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-6">
      <div className="flex flex-row items-start gap-4 lg:gap-6">
        {/* 左：配置区，空间不足时优先压缩；@container 让分区网格按列宽自适应 */}
        <div className="flex-1 min-w-0 space-y-5 @container">
          <BasicSettings config={config} update={update} errors={errors} />
          <ProductSettings config={config} update={update} errors={errors} />
          <DeliverySettings config={config} update={update} errors={errors} />
          <AdvancedOptimization config={config} update={update} errors={errors} />
          <CreativeSettings config={config} update={update} errors={errors} />
          <ScheduleSettings config={config} update={update} errors={errors} />
        </div>

        {/* 右：预览区，始终固定在右侧，窄屏适当收窄，无内部滚动 */}
        <aside className="w-[240px] lg:w-[280px] xl:w-[300px] 2xl:w-[330px] shrink-0 sticky top-6">
          <PreviewPanel config={config} />
        </aside>
      </div>
    </div>
  )
}
