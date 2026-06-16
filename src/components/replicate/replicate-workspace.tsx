"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  FlaskConical,
  Globe2,
  Hourglass,
  LockKeyhole,
  Play,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Wand2,
  Zap,
  Boxes,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LIFECYCLE_META,
  REPLICA_CATEGORY_META,
  type Material,
  type ReplicaDirection,
  type ReplicaCategory,
} from "@/lib/insights/types"
import {
  SELF_PRODUCTS,
  computeMatchScore,
  getDirectionsForMaterial,
  pickDefaultProduct,
} from "@/lib/insights/mock"

type Step = 2 | 3 | 4 // 2 = 方向, 3 = 确认, 4 = 已提交

interface Props {
  material: Material | null
  materialId: string
  productSkuFromQuery?: string
  sourceFromQuery?: string
}

export function ReplicateWorkspace({ material, materialId, productSkuFromQuery, sourceFromQuery }: Props) {
  if (!material) {
    return <NotFound id={materialId} />
  }

  return <Inner material={material} productSkuFromQuery={productSkuFromQuery} sourceFromQuery={sourceFromQuery} />
}

function Inner({ material, productSkuFromQuery, sourceFromQuery }: { material: Material; productSkuFromQuery?: string; sourceFromQuery?: string }) {
  // 源类型：querystring 决定（默认 own — 自有爆款）
  // "派生迭代" 不再是单独类型，未来若传 ?derive=<projectId> 再补 lineage 注入
  const sourceCategory: ReplicaCategory =
    sourceFromQuery === "discover" ? "market" : "own"

  // 选中的自有产品
  const initialSku = productSkuFromQuery && SELF_PRODUCTS.some((p) => p.sku === productSkuFromQuery)
    ? productSkuFromQuery
    : pickDefaultProduct(material).sku
  const [productSku, setProductSku] = useState<string>(initialSku)
  const product = useMemo(() => SELF_PRODUCTS.find((p) => p.sku === productSku) ?? SELF_PRODUCTS[0], [productSku])

  const match = useMemo(() => computeMatchScore(material, product), [material, product])

  const allDirections = useMemo(() => getDirectionsForMaterial(material), [material])
  const directions = useMemo(
    () => allDirections.filter((d) => d.lifecycleFit.includes(material.lifecyclePhase)).length > 0
      ? allDirections.filter((d) => d.lifecycleFit.includes(material.lifecyclePhase))
      : allDirections,
    [allDirections, material.lifecyclePhase]
  )

  const [step, setStep] = useState<Step>(2)
  const [directionId, setDirectionId] = useState<ReplicaDirection["id"]>(directions[0]?.id ?? "A")
  const direction = directions.find((d) => d.id === directionId) ?? directions[0]

  const [variantCount, setVariantCount] = useState(3)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (step !== 4 || progress >= 100) return
    const t = window.setInterval(() => setProgress((p) => Math.min(100, p + 4)), 220)
    return () => window.clearInterval(t)
  }, [step, progress])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--soft-2)]">
      <Header sourceCategory={sourceCategory} material={material} product={product} step={step} setStep={setStep} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto px-8 py-6">
          <div className="grid grid-cols-[280px_1fr] gap-6">
            <ContextRail material={material} product={product} sourceCategory={sourceCategory} match={match} />

            <main>
              {step === 2 && (
                <DirectionStep
                  material={material}
                  directions={directions}
                  selectedId={directionId}
                  onSelect={setDirectionId}
                  variantCount={variantCount}
                  setVariantCount={setVariantCount}
                />
              )}
              {step === 3 && direction && (
                <ConfirmStep
                  material={material}
                  product={product}
                  direction={direction}
                  variantCount={variantCount}
                />
              )}
              {step === 4 && direction && (
                <SubmittedStep
                  material={material}
                  direction={direction}
                  variantCount={variantCount}
                  progress={progress}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      <StickyBar
        step={step}
        material={material}
        match={match}
        onBack={() => {
          if (step === 3) setStep(2)
          else if (step === 4) setStep(3)
        }}
        onContinue={() => {
          if (step === 2) setStep(3)
          else if (step === 3) {
            setStep(4)
            setProgress(0)
          }
        }}
        directionLocked={Boolean(direction)}
      />
    </div>
  )
}

// ─── Header（含三类爆款 ribbon + 紧凑 stepper） ──────────────────────────────

function Header({
  sourceCategory,
  material,
  product,
  step,
  setStep,
}: {
  sourceCategory: ReplicaCategory
  material: Material
  product: { name: string; sku: string }
  step: Step
  setStep: (s: Step) => void
}) {
  const catMeta = REPLICA_CATEGORY_META[sourceCategory]
  const lcMeta = LIFECYCLE_META[material.lifecyclePhase]
  return (
    <div className="px-8 pt-5 pb-3 border-b border-[var(--line)] bg-white">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-bold border"
              style={{ backgroundColor: catMeta.dot + "15", borderColor: catMeta.dot + "55", color: catMeta.dot }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catMeta.dot }} />
              {catMeta.label}
            </span>
            <span
              className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-bold border"
              style={{ backgroundColor: lcMeta.dot + "15", borderColor: lcMeta.dot + "55", color: lcMeta.dot }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lcMeta.dot }} />
              {lcMeta.label} · {material.ageDays}d
            </span>
            <span className="text-[11.5px] text-[var(--muted)] font-mono">{material.fingerprint}</span>
          </div>
          <h1 className="text-[19px] font-extrabold text-[var(--text)] leading-tight truncate">
            {material.name} · 复刻为 {product.name}
          </h1>
          <p className="text-[12px] text-[var(--muted)] mt-0.5">{catMeta.desc}</p>
        </div>

        <Stepper step={step} setStep={setStep} />
      </div>
    </div>
  )
}

function Stepper({ step, setStep }: { step: Step; setStep: (s: Step) => void }) {
  const items: { id: 1 | 2 | 3; label: string }[] = [
    { id: 1, label: "素材洞察" },
    { id: 2, label: "生产方向" },
    { id: 3, label: "确认复刻" },
  ]
  const isSubmitted: boolean = step === 4
  return (
    <div className="flex items-center gap-1 shrink-0">
      {items.map((it, i) => {
        const isComplete = it.id < (isSubmitted ? 3 : step) || (isSubmitted && it.id === 3)
        const isCurrent = !isSubmitted && it.id === step
        const clickable = it.id === 2 || it.id === 3
        return (
          <div key={it.id} className="flex items-center">
            <button
              type="button"
              disabled={!clickable || isSubmitted}
              onClick={() => clickable && !isSubmitted && setStep(it.id as Step)}
              className={cn(
                "h-8 px-3 rounded-full flex items-center gap-1.5 text-[12px] font-bold transition-colors",
                isCurrent ? "bg-[#18181b] text-white"
                  : isComplete ? "bg-[#dcfce7] text-[#15803d] cursor-pointer"
                  : "bg-[var(--soft)] text-[var(--muted)]",
                clickable && !isSubmitted && !isCurrent && "hover:bg-[var(--soft-2)] cursor-pointer"
              )}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{
                backgroundColor: isComplete ? "#16a34a" : isCurrent ? "rgba(255,255,255,0.25)" : "transparent",
                color: isComplete || isCurrent ? "white" : "var(--muted)",
                border: !isComplete && !isCurrent ? "1px solid var(--line-strong)" : "none",
              }}>
                {isComplete ? <Check size={10} strokeWidth={3} /> : it.id}
              </span>
              {it.label}
            </button>
            {i < items.length - 1 && <span className="w-3 h-px bg-[var(--line-strong)] mx-1" />}
          </div>
        )
      })}
      {isSubmitted && (
        <>
          <span className="w-3 h-px bg-[var(--line-strong)] mx-1" />
          <span className="h-8 px-3 rounded-full bg-[#fff7ed] text-[#9a3412] text-[12px] font-bold flex items-center gap-1.5">
            <FlaskConical size={12} /> 已提交
          </span>
        </>
      )}
    </div>
  )
}

// ─── 左侧 context rail ───────────────────────────────────────────────────────

function ContextRail({
  material,
  product,
  sourceCategory,
  match,
}: {
  material: Material
  product: { name: string; sku: string; image: string; coreSellingPoints: string[] }
  sourceCategory: ReplicaCategory
  match: ReturnType<typeof computeMatchScore>
}) {
  const meta = REPLICA_CATEGORY_META[sourceCategory]
  return (
    <aside className="space-y-3 sticky top-2 self-start">
      {/* 爆款源 */}
      <div className="rounded-2xl bg-white border border-[var(--line)] overflow-hidden">
        <div className="aspect-video bg-[var(--soft)] relative">
          <img src={material.thumb} alt={material.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/15">
            <Play size={22} className="text-white" fill="white" />
          </div>
          <span
            className="absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-bold backdrop-blur"
            style={{ backgroundColor: meta.dot + "cc", color: "white" }}
          >
            {meta.label}
          </span>
        </div>
        <div className="p-3">
          <p className="text-[12.5px] font-bold text-[var(--text)] truncate">{material.name}</p>
          <p className="text-[10.5px] text-[var(--muted)]">{material.industryTag} · {material.videoStyleTag}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
            <Stat label="ROI" value={material.metrics.roi.toFixed(2)} accent={material.metrics.roi >= 2 ? "ok" : "warn"} />
            <Stat label="CTR" value={`${(material.metrics.ctr * 100).toFixed(2)}%`} />
            <Stat label="证据" value={material.bucket === "core" ? "E3" : material.bucket === "potential" ? "E2" : "E1"} />
            <Stat label="账户" value={`${material.accountCount}`} />
          </div>
        </div>
      </div>

      {/* 自有产品 */}
      <div className="rounded-2xl bg-white border border-[var(--line)] p-3">
        <p className="text-[10.5px] font-bold text-[var(--muted)] mb-2 flex items-center gap-1">
          <Boxes size={10} /> 自有产品
        </p>
        <div className="flex items-center gap-2">
          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-[var(--text)] truncate">{product.name}</p>
            <p className="text-[10.5px] text-[var(--muted)]">SKU {product.sku}</p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {product.coreSellingPoints.slice(0, 4).map((s) => (
            <span key={s} className="h-5 px-1.5 rounded bg-[#fff7ed] text-[#9a3412] text-[10px] font-bold">{s}</span>
          ))}
        </div>
      </div>

      {/* Match summary */}
      <div className="rounded-2xl bg-white border border-[var(--line)] p-3">
        <p className="text-[10.5px] font-bold text-[var(--muted)] mb-2">匹配度</p>
        <div className="flex items-baseline gap-2">
          <span className="text-[24px] font-extrabold" style={{
            color: match.level === "high" ? "#16a34a" : match.level === "mid" ? "#a16207" : "#dc2626"
          }}>{match.total}</span>
          <span className="text-[10.5px] text-[var(--muted)]">/ 100</span>
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-1">
          {match.level === "high" ? "建议复刻" : match.level === "mid" ? "可复刻但需调整" : "建议改写或换产品"}
        </p>
      </div>
    </aside>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "ok" | "warn" }) {
  const color = accent === "ok" ? "#15803d" : accent === "warn" ? "#a16207" : "var(--text)"
  return (
    <div className="bg-[var(--soft-2)] rounded-md px-1.5 py-1">
      <p className="text-[var(--muted)] font-semibold leading-none">{label}</p>
      <p className="font-extrabold mt-0.5" style={{ color }}>{value}</p>
    </div>
  )
}

// ─── Step 2：方向卡 ───────────────────────────────────────────────────────────

function DirectionStep({
  material,
  directions,
  selectedId,
  onSelect,
  variantCount,
  setVariantCount,
}: {
  material: Material
  directions: ReplicaDirection[]
  selectedId: ReplicaDirection["id"]
  onSelect: (id: ReplicaDirection["id"]) => void
  variantCount: number
  setVariantCount: (n: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[var(--line)] p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[16px] font-extrabold text-[var(--text)]">这次想优先验证什么？</h2>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] font-semibold">
            <ShieldCheck size={12} /> 方向均自动锁定「必须保留」元素
          </span>
        </div>
        <p className="text-[12.5px] text-[var(--muted)] mb-4">
          系统已根据当前生命周期阶段「<span className="font-bold text-[var(--text)]">{LIFECYCLE_META[material.lifecyclePhase].label}</span>」过滤适配的方向，每个方向只动一个变量轴。
        </p>

        <div className="grid grid-cols-1 gap-3">
          {directions.map((d) => (
            <DirectionCard key={d.id} direction={d} selected={selectedId === d.id} onSelect={() => onSelect(d.id)} />
          ))}
        </div>
      </div>

      {/* 生成数量 */}
      <div className="bg-white rounded-2xl border border-[var(--line)] p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[12px] font-bold text-[var(--text)]">生成数量</p>
          <p className="text-[11px] text-[var(--muted)]">建议 2–4 个变体一次跑完，便于横向对比</p>
        </div>
        <div className="h-9 flex items-center gap-1 border border-[var(--line)] rounded-full overflow-hidden bg-white">
          <button type="button" onClick={() => setVariantCount(Math.max(1, variantCount - 1))} className="w-9 h-full hover:bg-[var(--soft-2)] cursor-pointer">−</button>
          <span className="w-10 text-center text-[14px] font-bold">{variantCount}</span>
          <button type="button" onClick={() => setVariantCount(Math.min(6, variantCount + 1))} className="w-9 h-full hover:bg-[var(--soft-2)] cursor-pointer">+</button>
        </div>
      </div>
    </div>
  )
}

function DirectionCard({ direction, selected, onSelect }: { direction: ReplicaDirection; selected: boolean; onSelect: () => void }) {
  const axisLabel = direction.axis === "hook" ? "开场 Hook" : direction.axis === "scene" ? "核心场景" : "卖点优先级"
  const conf = direction.confidence
  const confLabel = conf >= 0.75 ? "高" : conf >= 0.65 ? "中" : "低"
  const confColor = conf >= 0.75 ? "#16a34a" : conf >= 0.65 ? "#a16207" : "#dc2626"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left rounded-xl border-2 p-4 cursor-pointer transition-all",
        selected ? "border-[#18181b] bg-[var(--soft-2)]" : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-extrabold shrink-0",
          selected ? "bg-[#18181b] text-white" : "bg-[var(--soft)] text-[var(--muted)]"
        )}>{direction.id}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-extrabold text-[var(--text)]">{direction.title}</h3>
            <span className="h-5 px-1.5 rounded-md bg-[#ede9fe] text-[#6d28d9] text-[10px] font-bold">变量轴 · {axisLabel}</span>
          </div>
          <p className="text-[12.5px] text-[var(--muted)] mb-3">{direction.desc}</p>

          <div className="grid grid-cols-3 gap-3 text-[11.5px] mb-3">
            <Block label="保留不变" tone="keep">
              <ul className="space-y-0.5">
                {direction.keep.map((k) => <li key={k} className="flex items-start gap-1"><CheckCircle2 size={10} className="mt-0.5 text-[#16a34a] shrink-0" /><span>{k}</span></li>)}
              </ul>
            </Block>
            <Block label="本次只改变" tone="change">
              <p className="font-semibold text-[var(--text)]">{direction.change}</p>
            </Block>
            <Block label="预期影响 / 置信度" tone="impact">
              <p className="font-semibold text-[var(--text)]">{direction.impact}</p>
              <p className="mt-1 font-bold" style={{ color: confColor }}>{confLabel} · {conf.toFixed(2)}</p>
            </Block>
          </div>

          <div className="rounded-lg bg-white border border-dashed border-[var(--line)] p-2.5">
            <p className="text-[10px] font-semibold text-[var(--muted)] mb-0.5">Brief 预览（开场一句话，可编辑）</p>
            <p className="text-[12.5px] font-semibold text-[var(--text)] italic">"{direction.brief}"</p>
          </div>
        </div>
      </div>
    </button>
  )
}

function Block({ label, tone, children }: { label: string; tone: "keep" | "change" | "impact"; children: React.ReactNode }) {
  const meta = {
    keep:   { bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]", color: "text-[#15803d]" },
    change: { bg: "bg-[#eff6ff]", border: "border-[#bfdbfe]", color: "text-[#1d4ed8]" },
    impact: { bg: "bg-[#fefce8]", border: "border-[#fde68a]", color: "text-[#a16207]" },
  }[tone]
  return (
    <div className={cn("rounded-lg p-2 border", meta.bg, meta.border)}>
      <p className={cn("text-[10px] font-bold mb-1 uppercase tracking-wide", meta.color)}>{label}</p>
      <div className="text-[11.5px] text-[var(--text)] leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Step 3：确认 ─────────────────────────────────────────────────────────────

function ConfirmStep({ material, product, direction, variantCount }: { material: Material; product: { sku: string; name: string }; direction: ReplicaDirection; variantCount: number }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-[var(--line)] p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-[#16a34a]" />
          <h2 className="text-[16px] font-extrabold text-[var(--text)]">系统已检查 · 单一变量轴 · 无高风险合规项</h2>
        </div>
        <p className="text-[12.5px] text-[var(--muted)]">所选方向：<span className="font-bold text-[var(--text)]">{direction.title}</span></p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Boundary tone="keep" icon={<ShieldCheck size={13} />} title="必须保留" items={direction.keep} />
          <Boundary tone="change" icon={<Edit3 size={13} />} title="本次只改变" items={[direction.change]} />
          <Boundary tone="ban" icon={<Ban size={13} />} title="禁止复制" items={["原品牌素材与水印", "不可验证的承诺", "竞品对比性内容"]} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] p-5">
        <h3 className="text-[13.5px] font-extrabold text-[var(--text)] mb-3">生成规格</h3>
        <div className="grid grid-cols-5 gap-3 text-[11.5px]">
          <Spec icon={<Sparkles size={13} />} value={`${variantCount} 个版本`} label={`只动「${direction.axis === "hook" ? "开场" : direction.axis === "scene" ? "场景" : "卖点"}」`} />
          <Spec icon={<Smartphone size={13} />} value="TikTok In-Feed · 9:16" label="单条竖版 · 信息流" />
          <Spec icon={<Globe2 size={13} />} value="English · US" label="语言与市场" />
          <Spec icon={<Clock3 size={13} />} value="15 秒" label="视频时长" />
          <Spec icon={<Boxes size={13} />} value={product.sku} label={`产品 ${product.name.split(" ")[0]}`} />
        </div>
      </div>

      <div className="bg-[var(--soft-2)] border border-dashed border-[var(--line)] rounded-2xl p-4 text-[12px] text-[var(--muted)] leading-relaxed flex items-start gap-2">
        <LockKeyhole size={14} className="mt-0.5 shrink-0" />
        <span>
          复刻边界与生成规格已锁定，提交后系统会保留<span className="font-bold text-[var(--text)]">产品价值不变 · 多场景 Demo 结构不变 · 节奏不变</span>，
          失败版本会自动重试不影响其他版本。
        </span>
      </div>
    </div>
  )
}

function Boundary({ tone, icon, title, items }: { tone: "keep" | "change" | "ban"; icon: React.ReactNode; title: string; items: string[] }) {
  const meta = {
    keep:   { bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]", color: "text-[#15803d]", dot: "#16a34a" },
    change: { bg: "bg-[#eff6ff]", border: "border-[#bfdbfe]", color: "text-[#1d4ed8]", dot: "#2563eb" },
    ban:    { bg: "bg-[#fef2f2]", border: "border-[#fecaca]", color: "text-[#b91c1c]", dot: "#dc2626" },
  }[tone]
  return (
    <div className={cn("rounded-xl p-3 border", meta.bg, meta.border)}>
      <p className={cn("text-[11.5px] font-extrabold flex items-center gap-1 mb-2", meta.color)}>
        {icon} {title}
      </p>
      <ul className="space-y-1 text-[12px] text-[var(--text)]">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: meta.dot }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Spec({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-[var(--soft-2)] rounded-xl p-3">
      <div className="text-[var(--muted)] mb-1">{icon}</div>
      <p className="text-[12.5px] font-extrabold text-[var(--text)]">{value}</p>
      <p className="text-[10.5px] text-[var(--muted)] mt-0.5">{label}</p>
    </div>
  )
}

// ─── Step 4：已提交 ──────────────────────────────────────────────────────────

function SubmittedStep({ material, direction, variantCount, progress }: { material: Material; direction: ReplicaDirection; variantCount: number; progress: number }) {
  const complete = progress >= 100
  const tasks = Array.from({ length: variantCount }, (_, i) => ({
    id: String.fromCharCode(65 + i),
    label: i === 0 ? "立即结果前置" : i === 1 ? "痛点反差开场" : i === 2 ? "Proof 累积版" : `变体 ${i + 1}`,
    state: complete ? "done" : i === 0 ? "done" : i === 1 ? "running" : "waiting",
  }))

  return (
    <div className="space-y-4">
      <div className={cn(
        "rounded-2xl border p-5 flex items-center gap-4",
        complete ? "bg-[#f0fdf4] border-[#bbf7d0]" : "bg-white border-[var(--line)]"
      )}>
        <ProgressRing value={progress} complete={complete} />
        <div className="flex-1">
          <h2 className="text-[16px] font-extrabold text-[var(--text)]">
            {complete ? `${variantCount} 个变体已生成完成` : `正在生成 ${variantCount} 个变体`}
          </h2>
          <p className="text-[12px] text-[var(--muted)] mt-0.5">
            {complete ? "已通过脚本、字幕与基础质量检查；可批量预览或提交投放实验。" : "已提交至生成队列 · 可安全离开页面，完成后会通知。"}
          </p>
        </div>
        {complete && (
          <Link href="/ads/dashboard" className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center gap-1.5 hover:opacity-90">
            <FlaskConical size={13} /> 提交投放实验
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--line)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13.5px] font-extrabold text-[var(--text)]">生成任务 ({tasks.filter((t) => t.state === "done").length} / {variantCount})</h3>
          <span className="text-[11px] text-[var(--muted)] font-semibold">本轮变量轴：{direction.axis === "hook" ? "开场 Hook" : direction.axis === "scene" ? "核心场景" : "卖点优先级"}</span>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-[var(--line)]">
              <div className="w-12 h-12 rounded-lg bg-[var(--soft)] overflow-hidden relative shrink-0">
                <img src={material.thumb} alt="" className="w-full h-full object-cover" />
                {t.state === "done" && (
                  <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                    <Play size={14} className="text-white" fill="white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-bold text-[var(--text)] truncate">变体 {t.id} · {t.label}</p>
                <p className="text-[10.5px] font-semibold mt-0.5 flex items-center gap-1" style={{
                  color: t.state === "done" ? "#16a34a" : t.state === "running" ? "#a16207" : "var(--muted)"
                }}>
                  {t.state === "done" ? <CheckCircle2 size={11} /> : t.state === "running" ? <Sparkles size={11} /> : <Hourglass size={11} />}
                  {t.state === "done" ? "已完成" : t.state === "running" ? "生成中" : "排队中"}
                </p>
              </div>
              {t.state === "done" && (
                <button type="button" className="h-7 px-2.5 rounded-full border border-[var(--line)] text-[11px] font-bold hover:bg-[var(--soft-2)]">预览</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--soft-2)] border border-dashed border-[var(--line)] rounded-2xl p-4 text-[12px] text-[var(--muted)] leading-relaxed flex items-start gap-2">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <span>
          系统正在保护：<span className="font-bold text-[var(--text)]">产品价值 · 多场景 Demo 结构 · 15 秒快切节奏</span>。失败版本会自动重试，保留日志供人工排查。
        </span>
      </div>
    </div>
  )
}

function ProgressRing({ value, complete }: { value: number; complete: boolean }) {
  const size = 56
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={complete ? "#16a34a" : "#18181b"} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {complete ? <CheckCircle2 size={20} className="text-[#16a34a]" /> : <span className="text-[12px] font-extrabold text-[var(--text)]">{value}%</span>}
      </div>
    </div>
  )
}

// ─── Sticky bottom action bar ────────────────────────────────────────────────

function StickyBar({
  step,
  material,
  match,
  onBack,
  onContinue,
  directionLocked,
}: {
  step: Step
  material: Material
  match: ReturnType<typeof computeMatchScore>
  onBack: () => void
  onContinue: () => void
  directionLocked: boolean
}) {
  if (step === 4) {
    return (
      <div className="sticky bottom-0 bg-white border-t border-[var(--line)] px-8 py-3 flex items-center justify-between">
        <span className="text-[12px] text-[var(--muted)] flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-[#16a34a]" /> 复刻已提交 · 复刻边界与证据链已保留
        </span>
        <div className="flex items-center gap-2">
          <Link href="/insights" className="h-9 px-4 rounded-full border border-[var(--line)] text-[12.5px] font-bold hover:bg-[var(--soft-2)] flex items-center gap-1.5">
            <ArrowLeft size={13} /> 返回素材诊断
          </Link>
          <Link href="/ads/dashboard" className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center gap-1.5 hover:opacity-90">
            进入投放看板 <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky bottom-0 bg-white border-t border-[var(--line)] px-8 py-3 flex items-center justify-between gap-3">
      <span className="text-[12px] text-[var(--muted)] flex items-center gap-1.5">
        <LockKeyhole size={13} />
        已自动锁定「必须保留」元素 · 匹配度 <span className="font-bold text-[var(--text)]">{match.total}</span>
      </span>
      <div className="flex items-center gap-2">
        {step === 2 ? (
          <Link href="/insights" className="h-9 px-4 rounded-full border border-[var(--line)] text-[12.5px] font-bold hover:bg-[var(--soft-2)] flex items-center gap-1.5">
            <ArrowLeft size={13} /> 返回素材诊断
          </Link>
        ) : (
          <button type="button" onClick={onBack} className="h-9 px-4 rounded-full border border-[var(--line)] text-[12.5px] font-bold hover:bg-[var(--soft-2)] flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft size={13} /> 返回生产方向
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={!directionLocked}
          className={cn(
            "h-9 px-5 rounded-full text-white text-[12.5px] font-bold flex items-center gap-1.5",
            material.lifecyclePhase === "peak" ? "bg-[#ea580c]" : "bg-[#18181b]",
            directionLocked ? "cursor-pointer hover:opacity-90" : "opacity-50 cursor-not-allowed"
          )}
        >
          {step === 2 ? <>
            使用此方向继续 <ArrowRight size={13} />
          </> : <>
            {material.lifecyclePhase === "peak" ? <Zap size={13} /> : <Wand2 size={13} />}
            确认并开始生成
          </>}
        </button>
      </div>
    </div>
  )
}

// ─── NotFound ────────────────────────────────────────────────────────────────

function NotFound({ id }: { id: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--soft)] flex items-center justify-center mb-4">
        <Ban size={20} className="text-[var(--muted)]" />
      </div>
      <h2 className="text-[16px] font-extrabold text-[var(--text)] mb-1">找不到这条素材</h2>
      <p className="text-[12.5px] text-[var(--muted)] mb-4">素材 <span className="font-mono">{id}</span> 不存在或已归档</p>
      <Link href="/insights" className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center gap-1.5 hover:opacity-90">
        <ArrowLeft size={13} /> 返回素材诊断
      </Link>
    </div>
  )
}
