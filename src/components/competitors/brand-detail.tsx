"use client"

import Link from "next/link"
import { ChevronLeft, CalendarDays, Clock3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND_LIMIT, BRANDS, formatScore, type BrandDetailData } from "@/lib/competitors/mock"
import { useCollection, formatEta, CADENCE_SHORT } from "@/lib/competitors/collection"
import { scaleDetail } from "@/lib/competitors/tracked"
import { Sparkline } from "./charts"
import { CollectionPill } from "./collection-pill"
import { CollectionStrip } from "./detail/collection-strip"
import { CollectionFeed } from "./detail/collection-feed"
import { TrendLine } from "./detail/trend-line"
import { FormatDonut } from "./detail/format-donut"
import { CountryBars } from "./detail/country-bars"
import { CreativeInsightCard } from "./detail/creative-insight"
import { TopMaterials } from "./detail/top-materials"
import { MaterialLibrary } from "./detail/material-library"

export function BrandDetail({ detail: raw }: { detail: BrandDetailData }) {
  const col = useCollection(raw.profile.id)
  const collecting = col.phase !== "live"
  const detail = scaleDetail(raw, col)
  const { profile, totals, recent30 } = detail

  const heroKpis = [
    { label: collecting ? "已采集素材" : "素材总数", value: String(profile.materialCount), sub: collecting ? "采集完成前持续上升" : "公域已投放素材", lime: false },
    { label: "累计点赞", value: totals.likes, sub: "全量素材汇总", lime: false },
    { label: "收藏", value: totals.saves, sub: "全量素材汇总", lime: false },
    { label: "互动评分", value: totals.score, sub: "全量素材加权", lime: true },
  ]

  const recent = [
    { label: "新增素材", value: recent30.newMaterials },
    { label: "近期互动", value: recent30.recentEngagement },
    { label: "平均互动分", value: recent30.avgScore },
  ]

  return (
    <div className="space-y-4">
      {/* ─── Hero:品牌身份 + 互动汇总 + 近 30 天效果 ─────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-[#131316] px-6 pt-5 pb-5 shadow-[0_16px_40px_rgba(9,9,11,0.18)]">
        {/* lime 氛围光 */}
        <div className="pointer-events-none absolute -right-24 -top-32 h-[380px] w-[380px] rounded-full bg-[radial-gradient(closest-side,rgba(201,255,41,0.18),transparent)]" />
        <div className="pointer-events-none absolute -left-16 -bottom-40 h-[300px] w-[300px] rounded-full bg-[radial-gradient(closest-side,rgba(201,255,41,0.07),transparent)]" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Link
              href="/discover/brands"
              className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.16] transition-colors shrink-0"
            >
              <ChevronLeft size={15} strokeWidth={2.2} />
            </Link>
            <span
              className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-white text-[17px] font-extrabold shadow-[0_4px_14px_rgba(132,204,22,0.35)]"
              style={{ background: profile.logoBg }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="text-[20px] font-[850] text-white truncate leading-tight">{profile.name}</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-[19px] px-2 rounded-full bg-white/[0.08] text-[10.5px] font-bold text-white/60 flex items-center">
                  {profile.category}
                </span>
                <CollectionPill col={col} active={profile.active} variant="dark" />
                {collecting && (
                  <span className="h-[19px] px-2 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 bg-[var(--lime)] text-[#20251a]">
                    <span className="w-1 h-1 rounded-full bg-[#20251a] animate-pulse" />
                    活跃投放中
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <span className="text-[12px] font-bold text-white/40 tabular-nums">
              追踪 {BRANDS.length}/{BRAND_LIMIT}
            </span>
            {collecting ? (
              <>
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--lime)]/80 tabular-nums">
                  <Clock3 size={11} strokeWidth={2.2} />
                  {formatEta(col.etaMinutes)}
                </span>
                <span className="text-[11px] text-white/35 tabular-nums">已进行 {col.elapsedMinutes} 分钟</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-[11px] text-white/35 tabular-nums">
                  <CalendarDays size={11} strokeWidth={2.2} />
                  最新投放 {profile.lastAdDate}
                </span>
                <span className="text-[11px] text-white/35 tabular-nums">
                  上次更新 {col.lastSyncMinAgo} 分钟前
                </span>
              </>
            )}
          </div>
        </div>

        {/* 互动汇总 KPI 带 */}
        <div className="relative mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-4">
          {heroKpis.map((k, i) => (
            <div key={k.label} className={cn("min-w-0", i > 0 && "pl-6 border-l border-white/[0.08]")}>
              <p className="text-[11px] font-bold text-white/40">{k.label}</p>
              <p
                className={cn(
                  "mt-1.5 text-[30px] font-extrabold tracking-tight leading-none tabular-nums",
                  k.lime ? "text-[var(--lime)]" : "text-white"
                )}
              >
                {k.value}
              </p>
              <p className="mt-1.5 text-[11px] text-white/30">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* 近 30 天投放效果 / 采集进度:同一块玻璃条,按 phase 换内容 */}
        {collecting ? (
          <CollectionStrip col={col} />
        ) : (
          <div className="relative mt-5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-5 py-3.5 flex items-center gap-7 backdrop-blur">
            <div className="shrink-0 w-[128px]">
              <p className="text-[12.5px] font-extrabold text-white">近 30 天效果</p>
              <p className="text-[10.5px] text-white/35 mt-0.5">基于近 30 天投放素材</p>
            </div>
            <div className="flex-1 grid grid-cols-3">
              {recent.map((r, i) => (
                <div key={r.label} className={cn("flex items-baseline gap-2.5", i > 0 && "pl-7 border-l border-white/[0.08]")}>
                  <span className="text-[22px] font-extrabold tracking-tight text-white tabular-nums leading-none">
                    {formatScore(r.value)}
                  </span>
                  <span className="text-[11px] text-white/40">{r.label}</span>
                </div>
              ))}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <Sparkline data={profile.weeklyTrend} width={92} height={26} color="#c9ff29" />
              <span className="flex items-center gap-1.5 text-[10px] text-white/35">
                <span className="w-1 h-1 rounded-full bg-[var(--lime)] animate-pulse" />
                {CADENCE_SHORT} · 上次 {col.lastSyncMinAgo} 分钟前
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 追踪实况:两个 phase 都在。采集中默认展开;稳态默认折叠,展开可看每轮更新过程 */}
      <CollectionFeed col={col} />


      {/* ─── 图表 Bento:左 8 列(叙事)+ 右 4 列(结构) ──────────────── */}
      <section className="grid grid-cols-12 gap-4 items-stretch">
        <div className="col-span-8">
          <TrendLine
            data={detail.dailyTimeline}
            coveredDays={collecting ? col.daysCollected : undefined}
            targetDays={collecting ? col.daysTarget : undefined}
          />
        </div>
        <div className="col-span-4">
          <FormatDonut slices={detail.formatDist} total={profile.materialCount} collecting={collecting} />
        </div>
        <div className="col-span-8">
          <CreativeInsightCard
            insight={detail.creativeInsight}
            types={detail.creativeTypes}
            sampleNote={collecting && profile.materialCount < 30
              ? `基于已采集的 ${profile.materialCount} 条素材初步归纳 · 采集完成后自动重算`
              : undefined}
          />
        </div>
        <div className="col-span-4">
          <CountryBars countries={detail.countryTop} collecting={collecting} />
        </div>
      </section>

      <TopMaterials brandId={profile.id} collecting={collecting} />

      {/* 追踪到的其余素材 —— 格式 / 平台 / 状态 三维筛选 */}
      <MaterialLibrary brandId={profile.id} collecting={collecting} />
    </div>
  )
}
