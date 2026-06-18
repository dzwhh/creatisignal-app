"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  FileText,
  FlaskConical,
  LayoutGrid,
  Layers,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type GenerationOutcome,
  type GenerationStage,
  type GenerationTask,
  type HotItemVerdict,
  type MaterialSource,
  type ProductBrief,
  type RejectionReason,
  type ReplicaDirectionV2,
  type ElementBreakdown,
  type Material,
  GENERATION_STAGE_META,
} from "@/lib/insights/types"
import {
  MATERIALS,
  computeHotVerdict,
  get8ElementBreakdown,
  getDirectionsV2,
  mockGenerationOutcomes,
  pickDefaultProduct,
} from "@/lib/insights/mock"
import { ContextBar } from "./context-bar"
import { SourceStep } from "./steps/source-step"
import { VerdictStep } from "./steps/verdict-step"
import { BreakdownStep } from "./steps/breakdown-step"
import { loadSampleBreakdown } from "@/lib/replicate/breakdown-utils"
import { DirectionStep } from "./steps/direction-step"
import { ConfirmStep } from "./steps/confirm-step"

// ─── Public Props ────────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3 | 4 | 5

interface Props {
  material: Material | null            // 入参素材（drawer 跳入时已选）
  materialId: string                   // 路由参数（fp_xxx 或 "new"）
  productSkuFromQuery?: string
  sourceFromQuery?: string              // 推断初始 source
  initialStep?: StepId                  // ?step=N 优先；否则按 source 推断
}

export function ReplicateWorkspace({ material, materialId, productSkuFromQuery, sourceFromQuery, initialStep }: Props) {
  return <Inner material={material} materialId={materialId} productSkuFromQuery={productSkuFromQuery} sourceFromQuery={sourceFromQuery} initialStep={initialStep} />
}

// ─── Inner workspace with full state machine ─────────────────────────────────

function Inner({ material, productSkuFromQuery, sourceFromQuery, initialStep }: Props) {
  // 推断初始 source：discover→market_hot；insights→owned_hot；variant→owned_hot；否则按 material 决定
  const initialSource: MaterialSource | null =
    sourceFromQuery === "discover" ? "market_hot" :
    sourceFromQuery === "insights" ? "owned_hot" :
    material ? "owned_hot" : null

  // 初始 step 推断
  const computedInitialStep: StepId =
    initialStep ??
    (sourceFromQuery === "discover" ? 1 : material ? 2 : 1)

  const [step, setStep] = useState<StepId>(computedInitialStep)

  // Step 1 状态
  const [source, setSource] = useState<MaterialSource | null>(initialSource)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(material?.fingerprint ?? null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [productBrief, setProductBrief] = useState<Partial<ProductBrief>>(() => {
    const initialProd = material ? pickDefaultProduct(material) : null
    if (productSkuFromQuery || initialProd) {
      const p = initialProd ?? pickDefaultProduct(MATERIALS[0])
      return {
        image: p.image,
        name: p.name,
        category: p.category,
        sellingPoints: p.coreSellingPoints,
        sellingPointMode: "manual",
        audience: "户外通勤 / 修车爱好者 / EDC 用户（25-44 男）",
        scenes: p.matchableSceneTags,
        forbidden: ["医疗承诺", "竞品对比"],
      }
    }
    return { sellingPointMode: "manual" }
  })

  // 选中的素材对象（按 selectedMaterialId 查表）
  const selectedMaterial = useMemo(() => {
    if (!selectedMaterialId) return null
    return MATERIALS.find((m) => m.fingerprint === selectedMaterialId) ?? null
  }, [selectedMaterialId])

  // Step 2 verdict（进入 Step 2 时计算）
  const verdict: HotItemVerdict | null = useMemo(() => {
    if (!source || (!selectedMaterial && source !== "local_upload")) return null
    return computeHotVerdict(source, selectedMaterial ?? undefined, productBrief as ProductBrief)
  }, [source, selectedMaterial, productBrief])

  // Step 3 真实视频 breakdown（V2：接 sample-breakdown.json）
  const videoBreakdown = useMemo(() => loadSampleBreakdown(), [])

  // Step 3（旧）抽象元素拆解 — 保留兜底但 V2 不再使用
  const breakdown: ElementBreakdown[] = useMemo(() => {
    if (!selectedMaterial) return []
    return get8ElementBreakdown(selectedMaterial, productBrief as ProductBrief)
  }, [selectedMaterial, productBrief])

  // Step 4 directions
  const directions: ReplicaDirectionV2[] = useMemo(() => {
    if (!selectedMaterial) return []
    return getDirectionsV2(selectedMaterial, productBrief as ProductBrief)
  }, [selectedMaterial, productBrief])

  const [selectedDirectionId, setSelectedDirectionId] = useState<ReplicaDirectionV2["id"]>("A")

  // Step 5：任务批次（每次"再生成一次"产生一个新 task，3 outcome / task；新任务排前）
  const [tasks, setTasks] = useState<GenerationTask[]>([])
  const [stageProgress, setStageProgress] = useState<Record<GenerationStage, number>>({
    script_lock: 0,
    shot_gen: 0,
    subtitle: 0,
    safety_check: 0,
  })

  // 派生：扁平的 outcomes 列表（供 canNext 用）
  const allOutcomes = useMemo(() => tasks.flatMap((t) => t.outcomes), [tasks])

  // 当前正在生成的任务（一次只跑一个）
  const runningTaskId = useMemo(() => {
    const t = tasks.find((t) => t.outcomes.some((o) => o.status === "generating"))
    return t?.id
  }, [tasks])

  // 进入 Step 5 时创建首个任务 —— 仅启动一次（ref 守门）
  const initStartedRef = useRef(false)
  useEffect(() => {
    if (step !== 5) {
      initStartedRef.current = false
      return
    }
    if (initStartedRef.current || directions.length === 0) return
    initStartedRef.current = true

    const firstTask: GenerationTask = {
      id: `task_1`,
      index: 1,
      createdAt: new Date().toISOString(),
      outcomes: mockGenerationOutcomes(directions).map((o, i) => ({
        ...o,
        id: `task_1_${o.directionId}`,
        status: "generating" as const,
        progress: 0,
      })),
    }
    setTasks([firstTask])
    setStageProgress({ script_lock: 0, shot_gen: 0, subtitle: 0, safety_check: 0 })
  }, [step, directions])

  // 当 runningTaskId 变化（或新任务被加入）→ 跑 8s mock progress
  const lastRunRef = useRef<string | null>(null)
  useEffect(() => {
    if (!runningTaskId || lastRunRef.current === runningTaskId) return
    lastRunRef.current = runningTaskId

    setStageProgress({ script_lock: 0, shot_gen: 0, subtitle: 0, safety_check: 0 })

    const stages: GenerationStage[] = ["script_lock", "shot_gen", "subtitle", "safety_check"]
    const totalTicks = 20
    const tickMs = 400
    let tick = 0

    const timer = window.setInterval(() => {
      tick++
      // 4 阶段平均分配 tick
      const stageDuration = totalTicks / stages.length
      setStageProgress(() => {
        const next: Record<GenerationStage, number> = {
          script_lock: 0, shot_gen: 0, subtitle: 0, safety_check: 0,
        }
        for (let i = 0; i < stages.length; i++) {
          const stageStartTick = i * stageDuration
          const localTick = Math.max(0, tick - stageStartTick)
          next[stages[i]] = Math.min(100, Math.round((localTick / stageDuration) * 100))
        }
        return next
      })
      // 推进 running task 的 outcomes
      setTasks((prev) => prev.map((t) => {
        if (t.id !== runningTaskId) return t
        return {
          ...t,
          outcomes: t.outcomes.map((o) => {
            if (o.status === "adopted" || o.status === "rejected" || o.status === "edited" || o.status === "done") return o
            const newProgress = Math.min(100, Math.round((tick / totalTicks) * 100))
            return { ...o, progress: newProgress, status: newProgress >= 100 ? "done" : "generating" }
          }),
        }
      }))
      if (tick >= totalTicks) {
        setStageProgress({ script_lock: 100, shot_gen: 100, subtitle: 100, safety_check: 100 })
        setTasks((prev) => prev.map((t) => {
          if (t.id !== runningTaskId) return t
          return {
            ...t,
            outcomes: t.outcomes.map((o) =>
              o.status === "generating" || o.status === "pending"
                ? { ...o, progress: 100, status: "done" as const }
                : o
            ),
          }
        }))
        window.clearInterval(timer)
      }
    }, tickMs)

    return () => { window.clearInterval(timer) }
  }, [runningTaskId])

  // 再生成一次：新建 task 推到前面
  function handleRegenerate() {
    if (runningTaskId) return  // 上一个还没跑完，禁止
    const nextIndex = tasks.length + 1
    const newTask: GenerationTask = {
      id: `task_${nextIndex}`,
      index: nextIndex,
      createdAt: new Date().toISOString(),
      outcomes: mockGenerationOutcomes(directions).map((o) => ({
        ...o,
        id: `task_${nextIndex}_${o.directionId}`,
        status: "generating" as const,
        progress: 0,
      })),
    }
    setTasks((prev) => [newTask, ...prev])  // 新任务排前
  }

  // 改 outcome 状态（按 outcomeId 在所有 task 里查找）
  function patchOutcome(outcomeId: string, patch: Partial<GenerationOutcome>) {
    setTasks((prev) => prev.map((t) => ({
      ...t,
      outcomes: t.outcomes.map((o) => o.id === outcomeId ? { ...o, ...patch } : o),
    })))
  }
  function handleAdopt(outcomeId: string)   { patchOutcome(outcomeId, { status: "adopted", rejectionReason: undefined }) }
  function handleReject(outcomeId: string, reason: RejectionReason) { patchOutcome(outcomeId, { status: "rejected", rejectionReason: reason }) }
  function handleEdit(outcomeId: string)    { patchOutcome(outcomeId, { status: "edited" }) }

  // ─── Step 校验：可否进入下一步 ───────────────────────────────────────────
  const canNext: { ok: boolean; ctaLabel: string } = useMemo(() => {
    if (step === 1) {
      const materialChosen = Boolean(selectedMaterialId || uploadedFileName)
      if (!source) return { ok: false, ctaLabel: "先选择来源" }
      if (!materialChosen) return { ok: false, ctaLabel: "先选择一条素材" }
      if (!productBrief.image || !productBrief.name || !productBrief.sellingPoints?.length) {
        return { ok: false, ctaLabel: "补充商品信息" }
      }
      return { ok: true, ctaLabel: "开始爆款判定" }
    }
    if (step === 2) {
      if (!verdict) return { ok: false, ctaLabel: "等待判定" }
      if (verdict.verdict === "not_recommended") return { ok: false, ctaLabel: "返回重选素材" }
      return { ok: true, ctaLabel: "进入元素拆解" }
    }
    if (step === 3) {
      return { ok: true, ctaLabel: "生成 3 个方向脚本" }
    }
    if (step === 4) {
      return { ok: true, ctaLabel: "确认生成 3 个结果" }
    }
    // step 5
    const allDone = allOutcomes.length > 0 && allOutcomes.every((o) => o.status !== "pending" && o.status !== "generating")
    const adopted = allOutcomes.filter((o) => o.status === "adopted").length
    if (!allDone) return { ok: false, ctaLabel: "等待全部生成完成" }
    if (adopted === 0) return { ok: false, ctaLabel: "至少采纳 1 个结果" }
    return { ok: true, ctaLabel: "创建 GMV Max 实验草稿" }
  }, [step, source, selectedMaterialId, uploadedFileName, productBrief, verdict, allOutcomes])

  function goNext() {
    if (!canNext.ok) return
    if (step < 5) setStep((step + 1) as StepId)
    // step === 5 时跳投放看板（mock）
  }

  function goPrev() {
    if (step > 1) setStep((step - 1) as StepId)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--soft-2)]">
      {/* 顶部全局上下文条 */}
      <ContextBar source={source} lifecyclePhase={selectedMaterial?.lifecyclePhase} />

      {/* Stepper */}
      <Stepper step={step} setStep={(s) => setStep(s)} />

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto px-8 py-6">
          {step === 1 && (
            <SourceStep
              source={source}
              onSourceChange={setSource}
              selectedMaterialId={selectedMaterialId}
              onSelectMaterial={setSelectedMaterialId}
              uploadedFileName={uploadedFileName}
              onUploadFile={(name) => setUploadedFileName(name || null)}
              productBrief={productBrief}
              onProductBriefChange={setProductBrief}
            />
          )}
          {step === 2 && verdict && <VerdictStep verdict={verdict} />}
          {step === 3 && <BreakdownStep data={videoBreakdown} />}
          {step === 4 && (
            <DirectionStep
              directions={directions}
              selectedDirectionId={selectedDirectionId}
              onSelectDirection={setSelectedDirectionId}
            />
          )}
          {step === 5 && (
            <ConfirmStep
              tasks={tasks}
              directions={directions}
              stageProgress={stageProgress}
              hasRunningTask={Boolean(runningTaskId)}
              onAdopt={handleAdopt}
              onReject={handleReject}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>
      </div>

      {/* Sticky 底部单一主 CTA */}
      <StickyBar
        step={step}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  )
}

// ─── Stepper ────────────────────────────────────────────────────────────────

const STEPS: { id: StepId; label: string; icon: typeof Sparkles }[] = [
  { id: 1, label: "选择素材",  icon: FileText },
  { id: 2, label: "爆款判定",  icon: Stethoscope },
  { id: 3, label: "元素拆解",  icon: LayoutGrid },
  { id: 4, label: "生成方向",  icon: Layers },
  { id: 5, label: "确认生成",  icon: FlaskConical },
]

function Stepper({ step, setStep }: { step: StepId; setStep: (s: StepId) => void }) {
  return (
    <div className="px-8 py-3 bg-white border-b border-[var(--line)] flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const done = step > s.id
        const current = step === s.id
        const Icon = s.icon
        return (
          <div key={s.id} className="flex items-center">
            <button
              type="button"
              onClick={() => setStep(s.id)}
              className={cn(
                "h-8 px-3 rounded-full text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors",
                current ? "bg-[var(--near-black)] text-white"
                  : done ? "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]"
                  : "bg-[var(--soft)] text-[var(--muted)] hover:bg-[var(--soft-2)] hover:text-[var(--text)]"
              )}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{
                backgroundColor: done ? "#16a34a" : current ? "rgba(255,255,255,0.25)" : "transparent",
                color: done || current ? "white" : "var(--muted)",
                border: !done && !current ? "1px solid var(--line-strong)" : "none",
              }}>
                {done ? <Check size={10} strokeWidth={3} /> : s.id}
              </span>
              <Icon size={11} />
              {s.label}
            </button>
            {i < STEPS.length - 1 && <span className="w-2.5 h-px bg-[var(--line-strong)] mx-1" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Sticky bottom bar ──────────────────────────────────────────────────────

function StickyBar({ step, canNext, onPrev, onNext }: {
  step: StepId
  canNext: { ok: boolean; ctaLabel: string }
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-[var(--line)] px-8 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={onPrev}
            className="h-9 px-3.5 rounded-full border border-[var(--line)] text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft size={12} strokeWidth={2.4} />
            返回上一步
          </button>
        ) : (
          <Link
            href="/replicate"
            className="h-9 px-3.5 rounded-full border border-[var(--line)] text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] flex items-center gap-1.5"
          >
            <ArrowLeft size={12} strokeWidth={2.4} />
            返回工作台
          </Link>
        )}
        <span className="text-[11.5px] text-[var(--muted-2)] font-semibold flex items-center gap-1">
          <ShieldCheck size={11} />
          单一主按钮 · 流程不分支
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext.ok}
        className={cn(
          "h-10 px-5 rounded-full text-[13px] font-extrabold flex items-center gap-1.5 transition-opacity",
          canNext.ok
            ? "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
            : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
        )}
      >
        {canNext.ctaLabel}
        {canNext.ok && <ArrowRight size={13} strokeWidth={2.4} />}
      </button>
    </div>
  )
}
