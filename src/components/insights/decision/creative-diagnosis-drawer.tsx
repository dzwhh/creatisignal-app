"use client"

/**
 * 素材诊断详情抽屉 —— 六类诊断结果各有各的执行流。
 *
 * 生成类（可放量 / 需迭代 / 需换新）四步：数据诊断 → 选方向 → 生成新素材 → 投放配置，
 * 末步保存后直接路由到投放中心，不在这里做投放验证。
 * 非生成类（稳定投放 / 待观察 / 建议关停）三步，不进生成流。
 *
 * Step 2 分成两块独立来源：平台按变量推荐的方案、以及从弹窗引用进来的爆款。
 * 两块可以只用其一，也可以都用，但各自分区展示，避免分不清这一条参考是哪来的。
 */

import { useMemo, useState } from "react"
import {
  ArrowRight,
  Check,
  Eye,
  ImagePlus,
  Loader2,
  Lock,
  RefreshCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  WandSparkles,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DERIVATION_VARIABLES,
  ITERATION_VARIABLES,
  LINK_CHAIN,
  OBSERVE_BLOCKED_ACTIONS,
  OPTION_SOURCE_META,
  SAMPLE_MATURITY_RULE,
  STABLE_REVIEW_DEFAULT,
  STABLE_REVIEW_WINDOWS,
  cvrIndex,
  ctrIndex,
  dataQualityFor,
  formatMoney,
  getDirectionOptions,
  getOptionsForVariable,
  indexDelta,
  iterationLevels,
  primaryIterationStages,
  productById,
  roiIndex,
  stableBreachStatus,
  variableByKey,
  type CreativeDiagnosis,
  type CreativeOption,
  type DecisionStatus,
  type DeliveryIntent,
} from "@/lib/insights/decision-mock"
import {
  ConfirmDialog,
  ContextTable,
  CreativeThumb,
  DecisionBadge,
  DecisionDrawer,
  DrawerStepper,
  EvidenceCard,
  LinkChain,
  ResultCallout,
  SampleProgress,
  SectionTitle,
  VariableCard,
  VideoCard,
} from "./decision-ui"
import { ReferencePickerDialog } from "./reference-picker-dialog"

const DRAWER_WIDTH = 720
/** 单次投放最多带 5 条新素材（PRD：默认 3 个变体，可选 1～5） */
const MAX_PICK = 5

type DrawerPhase = "diagnose" | "choose" | "assets" | "config"

/** 一轮生成的产物 */
type GeneratedAsset = {
  id: string
  round: number
  title: string
  category: string
  cover: string
  /** 这条素材改了哪个变量 */
  variableLabel: string
  durationSec: number
}

type GenerationRound = {
  round: number
  at: string
  assets: GeneratedAsset[]
}

const CALLOUT_TONE: Record<DecisionStatus, "good" | "warn" | "info" | "danger" | "neutral"> = {
  scale: "good",
  iterate: "warn",
  refresh: "info",
  stop: "danger",
  stable: "neutral",
  observe: "info",
}

const STEPS_BY_STATUS: Record<DecisionStatus, string[]> = {
  scale: ["数据诊断", "选择衍生参考", "生成新素材", "投放配置"],
  iterate: ["数据诊断", "定位迭代变量", "生成新素材", "投放配置"],
  refresh: ["数据诊断", "选择新方向", "生成新素材", "投放配置"],
  stable: ["数据诊断", "复查与越界规则", "已加入监控"],
  observe: ["数据诊断", "样本与数据质量", "达标后自动重诊断"],
  stop: ["数据诊断", "止损确认", "移出素材池"],
}

const GENERATIVE: DecisionStatus[] = ["scale", "iterate", "refresh"]

/** 生成时间只在客户端产生，避免 SSR / CSR 文案不一致 */
function nowLabel() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
}

export function CreativeDiagnosisDrawer({
  creative,
  onClose,
  onCreateDelivery,
  onMarkHandled,
  onOpenDelivery,
}: {
  creative: CreativeDiagnosis | null
  onClose: () => void
  onCreateDelivery: (intent: DeliveryIntent) => void
  onMarkHandled: (creativeId: string, label: string) => void
  onOpenDelivery: (productId: string) => void
}) {
  const [phase, setPhase] = useState<DrawerPhase>("diagnose")
  const [generating, setGenerating] = useState(false)
  /** 多选：需迭代可以一次改多处，可放量也可以不选变量只用引用 */
  const [variableKeys, setVariableKeys] = useState<string[]>([])
  const [pickedRecommended, setPickedRecommended] = useState<CreativeOption[]>([])
  const [pickedReferences, setPickedReferences] = useState<CreativeOption[]>([])
  const [extraRefs, setExtraRefs] = useState<CreativeOption[]>([])
  const [referenceOpen, setReferenceOpen] = useState(false)
  const [rounds, setRounds] = useState<GenerationRound[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [reviewWindow, setReviewWindow] = useState(STABLE_REVIEW_DEFAULT)
  const [targetRoi, setTargetRoi] = useState(creative?.targetRoi ?? 1.8)
  const [dailyBudget, setDailyBudget] = useState(creative?.status === "scale" ? 3200 : 1800)
  const [observationHours, setObservationHours] = useState(
    creative?.status === "scale" ? 24 : creative?.status === "refresh" ? 72 : 48
  )
  const [winOrders, setWinOrders] = useState(creative?.status === "scale" ? 10 : 5)
  const [stopRoi, setStopRoi] = useState(creative?.status === "scale" ? 1.62 : 1.4)
  const [confirmStop, setConfirmStop] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const isGenerative = creative ? GENERATIVE.includes(creative.status) : false

  /** 平台按已选变量给出的推荐方案；需换新走方向卡 */
  const recommendedGroups = useMemo(() => {
    if (!creative) return []
    if (creative.status === "refresh") {
      return [{ key: "directions", label: "推荐的新方向", options: getDirectionOptions(creative) }]
    }
    return variableKeys.map((key) => ({
      key,
      label: variableByKey(key)?.label ?? key,
      options: getOptionsForVariable(key, creative.id),
    }))
  }, [creative, variableKeys])

  if (!creative) return null

  const product = productById(creative.productId)
  const steps = STEPS_BY_STATUS[creative.status]
  const currentStep = phase === "diagnose" ? 0 : phase === "choose" ? 1 : phase === "assets" ? 2 : 3

  const pickedAll = [...pickedRecommended, ...pickedReferences]
  const canGenerate = pickedAll.length > 0
  const allAssets = rounds.flatMap((item) => item.assets)
  const chosenAssets = allAssets.filter((asset) => selectedAssets.includes(asset.id))

  const makeToggle =
    (list: CreativeOption[], setList: (next: CreativeOption[]) => void) => (option: CreativeOption) => {
      if (list.some((item) => item.key === option.key)) {
        setList(list.filter((item) => item.key !== option.key))
        return
      }
      if (pickedAll.length >= MAX_PICK) return
      setList([...list, option])
    }

  /** 取消某个变量时，只清掉该变量下已选的推荐方案，引用的爆款不受影响 */
  const toggleVariable = (key: string) => {
    if (variableKeys.includes(key)) {
      setVariableKeys(variableKeys.filter((item) => item !== key))
      const dropped = new Set(getOptionsForVariable(key, creative.id).map((option) => option.key))
      setPickedRecommended((prev) => prev.filter((item) => !dropped.has(item.key)))
      return
    }
    setVariableKeys([...variableKeys, key])
  }

  const runGenerate = () => {
    setGenerating(true)
    window.setTimeout(() => {
      const round = rounds.length + 1
      const assets: GeneratedAsset[] = pickedAll.map((option, index) => ({
        id: `r${round}-${option.key}`,
        round,
        title: option.title,
        category: option.category,
        cover: option.cover,
        variableLabel:
          creative.status === "refresh"
            ? "方向重做"
            : option.variableKey
              ? (variableByKey(option.variableKey)?.label ?? option.category)
              : OPTION_SOURCE_META[option.source].label,
        durationSec: 16 + index * 2,
      }))
      setRounds((prev) => [{ round, at: nowLabel(), assets }, ...prev])
      setSelectedAssets((prev) => [...prev, ...assets.map((asset) => asset.id)].slice(0, MAX_PICK))
      setGenerating(false)
      setPhase("assets")
    }, 700)
  }

  const createIntent = () => {
    const variableLabels = variableKeys.map((key) => variableByKey(key)?.label).filter(Boolean) as string[]
    const title =
      creative.status === "scale"
        ? `${product.shortName}｜爆款衍生放量`
        : creative.status === "refresh"
          ? `${product.shortName}｜新方向测试`
          : `${product.shortName}｜${variableLabels.length > 0 ? variableLabels.join(" + ") : "局部迭代"}测试`

    onCreateDelivery({
      id: `draft-${creative.id}`,
      title,
      productId: product.id,
      sourceCreativeId: creative.id,
      sourceStatus: creative.status,
      creatives: [
        { id: creative.id, label: "原素材", kind: "origin", selected: true },
        ...chosenAssets.map((asset, index) => ({
          id: `V-${String.fromCharCode(65 + index)}`,
          label: `新素材 · ${asset.title}`,
          kind: "variant" as const,
          selected: true,
        })),
      ],
      targetRoi,
      dailyBudget,
      observationHours,
      winOrders,
      stopRoi,
      createdAt: "刚刚",
    })
    onClose()
  }

  const configValid =
    chosenAssets.length > 0 &&
    targetRoi > 0 &&
    dailyBudget >= 10 &&
    observationHours > 0 &&
    winOrders > 0 &&
    stopRoi > 0 &&
    stopRoi < targetRoi

  const footerNote = creative.protection
    ? "非素材问题，素材动作已禁用"
    : creative.status === "stop"
      ? "关停只移出当前商品素材池，可恢复、可审计"
      : phase === "config"
        ? configValid
          ? "保存后进入投放中心的待发布列表，确认发布前不会修改 TikTok 账户"
          : "止损 ROI 必须大于 0 且低于目标 ROAS，且至少选择 1 条新素材"
        : phase === "assets"
          ? `已生成 ${rounds.length} 轮 · 选中 ${chosenAssets.length} 条进入投放`
          : "规则版本 v1.0 · 结论基于当前 Benchmark 快照"

  return (
    <>
      <DecisionDrawer
        open
        width={DRAWER_WIDTH}
        title="素材诊断详情"
        description={`${creative.id} · ${product.name}`}
        onOpenChange={(open) => !open && onClose()}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-[10.5px] text-[var(--muted)]">{footerNote}</span>
            <div className="flex shrink-0 gap-2">
              {phase !== "diagnose" ? (
                <Button
                  variant="outline"
                  onClick={() => setPhase(phase === "config" ? "assets" : phase === "assets" ? "choose" : "diagnose")}
                >
                  上一步
                </Button>
              ) : (
                <Button variant="outline" onClick={onClose}>
                  关闭
                </Button>
              )}
              <PrimaryAction
                creative={creative}
                phase={phase}
                generating={generating}
                canGenerate={canGenerate}
                pickedCount={pickedAll.length}
                chosenAssetCount={chosenAssets.length}
                configValid={configValid}
                isGenerative={isGenerative}
                reviewWindow={reviewWindow}
                onNext={() => setPhase("choose")}
                onGenerate={runGenerate}
                onOpenConfig={() => setPhase("config")}
                onCreateIntent={createIntent}
                onStop={() => setConfirmStop(true)}
                onKeep={() => {
                  onMarkHandled(creative.id, creative.status === "stable" ? `已建 ${reviewWindow}h 复查` : "观察中")
                  onClose()
                }}
                onOpenDelivery={() => {
                  onClose()
                  onOpenDelivery(product.id)
                }}
              />
            </div>
          </div>
        }
      >
        <DrawerStepper steps={steps} current={currentStep} />

        <ResultCallout
          tone={creative.protection ? "neutral" : CALLOUT_TONE[creative.status]}
          badge={
            creative.protection ? (
              <Badge className="border-0 bg-zinc-100 text-zinc-700">
                <ShieldCheck size={11} />
                素材链路正常
              </Badge>
            ) : (
              <DecisionBadge status={creative.status} />
            )
          }
          headline={creative.headline}
          lines={[creative.evidence, `结论：${creative.advice}`]}
        />

        {phase === "diagnose" ? <DiagnosePanel creative={creative} product={product} /> : null}

        {phase === "choose" && creative.status === "scale" ? (
          <ScalePanel creative={creative} variableKeys={variableKeys} onToggleVariable={toggleVariable} />
        ) : null}

        {phase === "choose" && creative.status === "iterate" ? (
          <IteratePanel creative={creative} variableKeys={variableKeys} onToggleVariable={toggleVariable} />
        ) : null}

        {phase === "choose" && creative.status === "refresh" ? <RefreshPanel creative={creative} /> : null}

        {/* 两个独立来源区：平台推荐按变量分组，引用的爆款单独一块 */}
        {phase === "choose" && isGenerative ? (
          <>
            <RecommendedSection
              status={creative.status}
              groups={recommendedGroups}
              picked={pickedRecommended}
              atLimit={pickedAll.length >= MAX_PICK}
              onToggle={makeToggle(pickedRecommended, setPickedRecommended)}
            />
            <ReferenceSection
              options={extraRefs}
              picked={pickedReferences}
              atLimit={pickedAll.length >= MAX_PICK}
              totalPicked={pickedAll.length}
              onToggle={makeToggle(pickedReferences, setPickedReferences)}
              onOpenPicker={() => setReferenceOpen(true)}
              onRemove={(key) => {
                setExtraRefs((prev) => prev.filter((item) => item.key !== key))
                setPickedReferences((prev) => prev.filter((item) => item.key !== key))
              }}
            />
          </>
        ) : null}

        {phase === "choose" && creative.status === "stable" ? (
          <StablePanel creative={creative} reviewWindow={reviewWindow} onReviewWindowChange={setReviewWindow} />
        ) : null}

        {phase === "choose" && creative.status === "observe" ? (
          <ObservePanel
            creative={creative}
            syncing={syncing}
            onSync={() => {
              setSyncing(true)
              window.setTimeout(() => setSyncing(false), 900)
            }}
          />
        ) : null}

        {phase === "choose" && creative.status === "stop" ? <StopPanel creative={creative} /> : null}

        {phase === "assets" ? (
          <GeneratedAssets
            creative={creative}
            rounds={rounds}
            selected={selectedAssets}
            generating={generating}
            onToggle={(id) =>
              setSelectedAssets((prev) => {
                if (prev.includes(id)) return prev.filter((item) => item !== id)
                if (prev.length >= MAX_PICK) return prev
                return [...prev, id]
              })
            }
            onRegenerate={runGenerate}
          />
        ) : null}

        {phase === "config" ? (
          <DeliveryConfig
            productName={product.name}
            sku={product.sku}
            assets={chosenAssets}
            originId={creative.id}
            targetRoi={targetRoi}
            dailyBudget={dailyBudget}
            observationHours={observationHours}
            winOrders={winOrders}
            stopRoi={stopRoi}
            onTargetRoiChange={setTargetRoi}
            onDailyBudgetChange={setDailyBudget}
            onObservationHoursChange={setObservationHours}
            onWinOrdersChange={setWinOrders}
            onStopRoiChange={setStopRoi}
          />
        ) : null}
      </DecisionDrawer>

      <ReferencePickerDialog
        open={referenceOpen}
        onOpenChange={setReferenceOpen}
        max={MAX_PICK}
        alreadySelected={pickedAll.length}
        onConfirm={(items) => {
          setExtraRefs((prev) => [...items.filter((item) => !prev.some((exist) => exist.key === item.key)), ...prev])
          // 上限按「推荐 + 引用」的总数算，只对引用区切片会让总数越界
          setPickedReferences((prev) => {
            const room = MAX_PICK - pickedRecommended.length - prev.length
            if (room <= 0) return prev
            const fresh = items.filter((item) => !prev.some((exist) => exist.key === item.key))
            return [...prev, ...fresh.slice(0, room)]
          })
        }}
      />

      <ConfirmDialog
        open={confirmStop}
        onOpenChange={setConfirmStop}
        title="确认关停这条素材？"
        description="关停后该素材将移出当前商品的 GMV Max 素材池，不会删除素材资产，也不影响它在其他商品中的使用。"
        impacts={[
          { label: "素材", value: creative.id },
          { label: "关联商品", value: product.name },
          { label: "当前消耗", value: `${formatMoney(creative.spend)} · ${creative.orders} 单` },
          {
            label: "素材供给",
            value: creative.supplyAfterStop
              ? `${creative.supplyAfterStop.before} → ${creative.supplyAfterStop.after} 条`
              : "不变",
          },
        ]}
        recoverHint="操作会记录 operator、before/after 与 request_id，可在任务记录中随时恢复。"
        confirmLabel="确认关停"
        onConfirm={() => {
          setConfirmStop(false)
          onMarkHandled(creative.id, "已移出素材池")
          onClose()
        }}
      />
    </>
  )
}

// ─── Step 1 数据诊断 ─────────────────────────────────────────────────────────

function DiagnosePanel({
  creative,
  product,
}: {
  creative: CreativeDiagnosis
  product: ReturnType<typeof productById>
}) {
  const ctrDelta = indexDelta(ctrIndex(creative))
  const cvrDelta = indexDelta(cvrIndex(creative))
  const roiDelta = indexDelta(roiIndex(creative))

  return (
    <>
      <SectionTitle>系统为什么这样判断</SectionTitle>
      <div className="mb-5 grid grid-cols-3 gap-2">
        <EvidenceCard
          label="CTR"
          value={`${creative.ctr.toFixed(2)}%`}
          hint={`均值 ${creative.benchmarkCtr.toFixed(2)}% · ${ctrDelta >= 0 ? "+" : ""}${ctrDelta}%`}
          tone={ctrDelta >= -10 ? "good" : "bad"}
        />
        <EvidenceCard
          label="CVR"
          value={`${creative.cvr.toFixed(2)}%`}
          hint={`均值 ${creative.benchmarkCvr.toFixed(2)}% · ${cvrDelta >= 0 ? "+" : ""}${cvrDelta}%`}
          tone={cvrDelta >= -10 ? "good" : "bad"}
        />
        <EvidenceCard
          label={creative.status === "observe" ? "样本状态" : "ROI / 目标"}
          value={creative.status === "observe" ? creative.sample : creative.roi.toFixed(2)}
          hint={
            creative.status === "observe"
              ? `可信度 ${creative.confidence}%`
              : `目标 ${creative.targetRoi.toFixed(2)} · ${roiDelta >= 0 ? "+" : ""}${roiDelta}%`
          }
          tone={creative.status === "observe" ? "default" : roiDelta >= 0 ? "good" : "bad"}
        />
      </div>

      {creative.protection ? (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-[12.5px] font-extrabold text-blue-900">系统不会让你为了动作而换素材</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-blue-800">
            CTR Index 与 CVR Index 均 ≥ 0.90，问题不在素材链路。生成变体、生成新方向与关停已被禁用，
            请优先检查商品价格、客单价、库存、佣金或投放设置。
          </p>
        </div>
      ) : null}

      <SectionTitle>下一步执行计划</SectionTitle>
      <ContextTable
        rows={[
          { label: "关联商品", value: product.name, hint: `${product.sku} · ${product.country}` },
          { label: "素材动作", value: creative.nextPlan.action },
          {
            label: creative.status === "stop" ? "影响范围" : "观察与判赢",
            value: creative.nextPlan.observation,
            hint:
              creative.status === "iterate" || creative.status === "scale" ? "未达止损线自动标记「建议关停」" : undefined,
          },
        ]}
      />
    </>
  )
}

// ─── Step 2 区块 A：平台推荐（按变量分组） ───────────────────────────────────

function RecommendedSection({
  status,
  groups,
  picked,
  atLimit,
  onToggle,
}: {
  status: DecisionStatus
  groups: Array<{ key: string; label: string; options: CreativeOption[] }>
  picked: CreativeOption[]
  atLimit: boolean
  onToggle: (option: CreativeOption) => void
}) {
  const total = groups.reduce((sum, group) => sum + group.options.length, 0)

  return (
    <div className="mb-5 rounded-2xl border border-[var(--line)] p-3.5">
      <SectionTitle
        action={
          <span className="text-[10.5px] tabular-nums text-[var(--muted)]">
            已选 {picked.length} / 共 {total}
          </span>
        }
      >
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#5a7821]" />
          平台推荐方案
        </span>
      </SectionTitle>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-6 text-center text-[10.5px] leading-relaxed text-[var(--muted)]">
          {status === "refresh" ? "暂无推荐方向" : "还没有选择要改的变量 —— 选一个后这里会出对应方案，也可以跳过、只用下方引用的爆款"}
        </p>
      ) : (
        <div className="space-y-3.5">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-extrabold text-[var(--text)]">
                <span className="size-1.5 rounded-full bg-[var(--lime)]" />
                {group.label}
                <span className="font-semibold text-[var(--muted)]">· {group.options.length} 个方案</span>
              </p>
              <div className="grid grid-cols-4 gap-2.5">
                {group.options.map((option) => (
                  <VideoCard
                    key={option.key}
                    cover={option.cover}
                    category={option.category}
                    title={option.title}
                    desc={option.desc}
                    script={option.script}
                    selected={picked.some((item) => item.key === option.key)}
                    disabled={atLimit}
                    onToggle={() => onToggle(option)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 2 区块 B：引用的爆款 ───────────────────────────────────────────────

function ReferenceSection({
  options,
  picked,
  atLimit,
  totalPicked,
  onToggle,
  onOpenPicker,
  onRemove,
}: {
  options: CreativeOption[]
  picked: CreativeOption[]
  atLimit: boolean
  totalPicked: number
  onToggle: (option: CreativeOption) => void
  onOpenPicker: () => void
  onRemove: (key: string) => void
}) {
  return (
    <div className="mb-5 rounded-2xl border border-[var(--line)] p-3.5">
      <SectionTitle
        action={
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] tabular-nums text-[var(--muted)]">已选 {picked.length}</span>
            <Button size="sm" variant="outline" onClick={onOpenPicker}>
              <ImagePlus size={12} />
              引用爆款
            </Button>
          </div>
        }
      >
        <span className="flex items-center gap-1.5">
          <ImagePlus size={12} className="text-[var(--muted)]" />
          引用的爆款参考
        </span>
      </SectionTitle>

      {options.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line-strong)] px-4 py-6 text-center text-[10.5px] leading-relaxed text-[var(--muted)]">
          还没有引用任何爆款 —— 可以从市场、竞对、自有素材里挑，也可以上传本地或粘贴视频链接
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {options.map((option) => (
            <VideoCard
              key={option.key}
              cover={option.cover}
              category={option.category}
              title={option.title}
              desc={option.desc}
              script={option.script}
              sourceLabel={OPTION_SOURCE_META[option.source].label}
              sourceClassName={OPTION_SOURCE_META[option.source].className}
              selected={picked.some((item) => item.key === option.key)}
              disabled={atLimit}
              onToggle={() => onToggle(option)}
              onRemove={() => onRemove(option.key)}
            />
          ))}
        </div>
      )}

      <p className="mt-2.5 text-[10px] text-[var(--muted)]">
        两块可以只用其一，也可以都用 · 本次投放最多带 {MAX_PICK} 条新素材（当前 {totalPicked} 条）
      </p>
    </div>
  )
}

/** 变量多选 chip */
function VariableChips({
  variables,
  value,
  onToggle,
}: {
  variables: typeof DERIVATION_VARIABLES
  value: string[]
  onToggle: (key: string) => void
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {variables.map((variable) => {
        const active = value.includes(variable.key)
        return (
          <button
            key={variable.key}
            type="button"
            onClick={() => onToggle(variable.key)}
            aria-pressed={active}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[11.5px] font-bold transition-colors",
              active
                ? "bg-[var(--near-black)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
            )}
          >
            {active ? <Check size={11} strokeWidth={3} /> : <Lock size={10} className="text-[var(--muted-2)]" />}
            {variable.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Step 2 · 可放量 ─────────────────────────────────────────────────────────

function ScalePanel({
  creative,
  variableKeys,
  onToggleVariable,
}: {
  creative: CreativeDiagnosis
  variableKeys: string[]
  onToggleVariable: (key: string) => void
}) {
  const structure = [...creative.title.split("｜"), creative.format].filter(Boolean)
  const selected = variableKeys.map((key) => variableByKey(key)).filter(Boolean)

  return (
    <>
      <SectionTitle action={<Badge className="border-0 bg-emerald-50 text-emerald-700">已验证赢家</Badge>}>
        衍生基准
      </SectionTitle>
      <div className="mb-5 flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
        <CreativeThumb accent={creative.accent} className="h-[76px] w-[52px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[11px] font-extrabold text-[var(--text)]">{creative.id}</p>
          <p className="mt-1 flex flex-wrap gap-1">
            {structure.map((tag) => (
              <span key={tag} className="rounded bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-[var(--text)]">
                {tag}
              </span>
            ))}
          </p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--muted)]">
            ROI {creative.roi.toFixed(2)}（超目标 {indexDelta(roiIndex(creative))}%）· 订单 {creative.orders} 条。
            以上结构已被数据验证有效，默认全部保留。
          </p>
        </div>
      </div>

      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">可多选，也可以不选</span>}>
        这轮衍生改哪一个
      </SectionTitle>
      <VariableChips variables={DERIVATION_VARIABLES} value={variableKeys} onToggle={onToggleVariable} />
      {selected.length > 0 ? (
        <p className="mb-5 rounded-lg bg-[var(--soft-2)] px-3 py-2 text-[10px] leading-relaxed text-[var(--muted)]">
          本轮验证 <strong className="text-[var(--text)]">{selected.map((item) => item?.label).join(" + ")}</strong>，
          其余结构继承原素材。选中的变量会在下方「平台推荐方案」里各出一组候选。
        </p>
      ) : (
        <p className="mb-5 rounded-lg bg-[var(--soft-2)] px-3 py-2 text-[10px] leading-relaxed text-[var(--muted)]">
          不选也可以 —— 直接在下面「引用的爆款参考」里挑素材做衍生
        </p>
      )}
    </>
  )
}

// ─── Step 2 · 需迭代 ─────────────────────────────────────────────────────────

function IteratePanel({
  creative,
  variableKeys,
  onToggleVariable,
}: {
  creative: CreativeDiagnosis
  variableKeys: string[]
  onToggleVariable: (key: string) => void
}) {
  const levels = iterationLevels(creative)
  const primary = primaryIterationStages(creative)
  const ctrWeak = ctrIndex(creative) < 0.9
  const variables = [...ITERATION_VARIABLES]
    .map((variable) => ({
      ...variable,
      recommended: primary.includes(variable.stage),
      secondary: levels[variable.stage] === "secondary",
    }))
    .sort((a, b) => Number(b.recommended) - Number(a.recommended) || Number(b.secondary) - Number(a.secondary))

  return (
    <>
      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">弱环由 CTR / CVR 定位</span>}>
        问题出在哪一环
      </SectionTitle>
      <div className="mb-2.5">
        <LinkChain stages={LINK_CHAIN} levels={levels} />
      </div>
      <p className="mb-5 rounded-lg bg-amber-50/70 px-3 py-2 text-[10px] leading-relaxed text-amber-800">
        {ctrWeak
          ? `CTR ${creative.ctr.toFixed(2)}% 低于基准 ${Math.abs(indexDelta(ctrIndex(creative)))}%，CVR 仍在基准 90% 以上 —— 问题发生在点击前，所以是需迭代而不是需换新。CTR 无法区分是开场还是场景，前 3 秒是最强因子所以列为主迭代，场景 / 人物作为次迭代。`
          : `CVR ${creative.cvr.toFixed(2)}% 低于基准 ${Math.abs(indexDelta(cvrIndex(creative)))}%，CTR 正常 —— 人能被吸引进来但没被说服。卖点与证明列为主迭代，Offer / CTA 作为次迭代。`}
      </p>

      <SectionTitle
        action={
          <span className="text-[10.5px] text-[var(--muted)]">
            可多选 · 已选 {variableKeys.length}
          </span>
        }
      >
        选择这轮要迭代的变量
      </SectionTitle>
      <div className="mb-2 grid grid-cols-2 gap-2">
        {variables.map((item) => (
          <VariableCard
            key={item.key}
            label={item.label}
            desc={item.desc}
            targetMetric={item.targetMetric}
            locked={item.locked}
            recommended={item.recommended}
            secondary={item.secondary}
            selected={variableKeys.includes(item.key)}
            onSelect={() => onToggleVariable(item.key)}
          />
        ))}
      </div>
      <p className="mb-5 text-[10px] leading-relaxed text-[var(--muted)]">
        {variableKeys.length > 1
          ? `同时改 ${variableKeys.length} 处会更快找到方向，但单条素材的效果变化无法归因到具体某一处 —— 想要可归因的结论就一次只改一处。`
          : "选中的变量会在下方各出一组候选方案；也可以不选，直接引用爆款。"}
      </p>
    </>
  )
}

// ─── Step 2 · 需换新 ─────────────────────────────────────────────────────────

function RefreshPanel({ creative }: { creative: CreativeDiagnosis }) {
  const failed = [...creative.title.split("｜"), creative.format, creative.issueTag].filter(Boolean)

  return (
    <>
      <SectionTitle action={<Badge className="border-0 bg-red-50 text-red-700">双链路已衰退</Badge>}>
        已验证无效的方向
      </SectionTitle>
      <div className="mb-4 rounded-xl border border-red-100 bg-red-50/60 p-3">
        <p className="flex flex-wrap gap-1">
          {failed.map((tag) => (
            <span key={tag} className="rounded bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-red-700 line-through">
              {tag}
            </span>
          ))}
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-red-700">
          CTR 低 {Math.abs(indexDelta(ctrIndex(creative)))}%、CVR 低 {Math.abs(indexDelta(cvrIndex(creative)))}%，
          连续两个诊断窗口未恢复。换新不是再改一环，而是换掉整个表达方向，请避免重复以上组合。
        </p>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        {[
          { label: "商品", desc: "SKU、价格与库存信息" },
          { label: "品牌", desc: "品牌名、Logo 与调性" },
          { label: "合规", desc: "功效话术与免责声明" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-2.5">
            <p className="flex items-center gap-1 text-[10.5px] font-extrabold text-[var(--text)]">
              <Lock size={10} className="text-[var(--muted-2)]" />
              {item.label}
            </p>
            <p className="mt-0.5 text-[9.5px] leading-relaxed text-[var(--muted)]">{item.desc}</p>
          </div>
        ))}
      </div>
      <p className="mb-5 text-[10px] text-[var(--muted)]">以上三项保留，其余（Hook、场景、人设、表达结构）全部重做</p>
    </>
  )
}

// ─── Step 2 · 稳定投放 ───────────────────────────────────────────────────────

function StablePanel({
  creative,
  reviewWindow,
  onReviewWindowChange,
}: {
  creative: CreativeDiagnosis
  reviewWindow: number
  onReviewWindowChange: (value: number) => void
}) {
  const rules = stableBreachStatus(creative)
  const nearScale = roiIndex(creative) >= 1.08

  return (
    <>
      <div className="mb-5 flex gap-2 rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--muted)]" />
        <p className="text-[10.5px] leading-relaxed text-[var(--muted)]">
          这一步<strong className="text-[var(--text)]">不会修改任何 GMV Max 配置</strong>——不动目标 ROI、不动预算、不动素材池，
          只创建一个复查任务，到点自动重跑诊断。
        </p>
      </div>

      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">默认 {STABLE_REVIEW_DEFAULT}h</span>}>
        复查窗口
      </SectionTitle>
      <div className="mb-5 flex gap-2">
        {STABLE_REVIEW_WINDOWS.map((hours) => (
          <button
            key={hours}
            type="button"
            onClick={() => onReviewWindowChange(hours)}
            aria-pressed={reviewWindow === hours}
            className={cn(
              "h-8 flex-1 cursor-pointer rounded-lg text-[11.5px] font-bold transition-colors",
              reviewWindow === hours
                ? "bg-[var(--near-black)] text-white"
                : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
            )}
          >
            {hours >= 168 ? "7 天" : `${hours} 小时`}
          </button>
        ))}
      </div>

      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">第一版不开放修改</span>}>
        触发重新诊断的越界条件
      </SectionTitle>
      <div className="mb-5 overflow-hidden rounded-xl border border-[var(--line)]">
        <div className="grid grid-cols-[1fr_92px_92px_64px] gap-2 bg-[var(--soft-2)] px-3 py-2 text-[9.5px] font-extrabold uppercase text-[var(--muted)]">
          <span>条件</span>
          <span className="text-right">阈值</span>
          <span className="text-right">当前值</span>
          <span className="text-right">状态</span>
        </div>
        {rules.map((rule) => (
          <div
            key={rule.key}
            className="grid grid-cols-[1fr_92px_92px_64px] items-center gap-2 border-t border-[var(--line)] px-3 py-2.5"
          >
            <span className="truncate text-[11px] font-bold text-[var(--text)]">{rule.label}</span>
            <span className="text-right font-mono text-[10.5px] text-[var(--muted)]">{rule.threshold}</span>
            <span className="text-right font-mono text-[11px] font-bold tabular-nums text-[var(--text)]">
              {rule.current}
            </span>
            <span className="flex justify-end">
              {rule.ok ? (
                <Badge className="border-0 bg-emerald-50 text-emerald-700">正常</Badge>
              ) : (
                <Badge className="border-0 bg-red-50 text-red-700">越界</Badge>
              )}
            </span>
          </div>
        ))}
      </div>

      {nearScale ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e5f4b8] bg-[#f7ffe4] p-3">
          <div className="min-w-0">
            <p className="text-[11.5px] font-extrabold text-[var(--text)]">已经接近放量线</p>
            <p className="mt-0.5 text-[10px] text-[var(--muted)]">
              ROI Index {roiIndex(creative).toFixed(2)}，距离 1.15 的放量门槛不远，可以先加入候选名单
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Eye size={12} />
            加入放量候选
          </Button>
        </div>
      ) : null}
    </>
  )
}

// ─── Step 2 · 待观察 ─────────────────────────────────────────────────────────

function ObservePanel({
  creative,
  syncing,
  onSync,
}: {
  creative: CreativeDiagnosis
  syncing: boolean
  onSync: () => void
}) {
  const checks = dataQualityFor(creative)
  const failing = checks.filter((check) => !check.ok)
  const gap = creative.sampleGap

  return (
    <>
      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">可信度 {creative.confidence}%</span>}>
        还差多少才能判断
      </SectionTitle>
      <div className="mb-3 space-y-3 rounded-xl border border-[var(--line)] p-4">
        {gap ? (
          <>
            <SampleProgress label="消耗进度" current={creative.spend} target={creative.spend + gap.spendNeeded} unit="USD" />
            <SampleProgress label="订单进度" current={creative.orders} target={creative.orders + gap.ordersNeeded} unit="单" />
            <p className="text-[10.5px] leading-relaxed text-[var(--muted)]">
              还差约 ${gap.spendNeeded} 消耗或 {gap.ordersNeeded} 个订单 · 预计 {gap.hoursLeft} 小时后可给出结论
            </p>
          </>
        ) : (
          <p className="text-[10.5px] text-[var(--muted)]">样本已达标，正在重新诊断</p>
        )}
      </div>
      <p className="mb-5 rounded-lg bg-[var(--soft-2)] px-3 py-2 font-mono text-[10px] leading-relaxed text-[var(--muted)]">
        判断门槛：{SAMPLE_MATURITY_RULE}
      </p>

      <SectionTitle
        action={
          failing.length > 0 ? (
            <Button size="sm" variant="outline" disabled={syncing} onClick={onSync}>
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
              {syncing ? "同步中…" : "重试数据同步"}
            </Button>
          ) : (
            <Badge className="border-0 bg-emerald-50 text-emerald-700">全部正常</Badge>
          )
        }
      >
        数据质量检查
      </SectionTitle>
      <div className="mb-5 overflow-hidden rounded-xl border border-[var(--line)]">
        {checks.map((check, index) => (
          <div
            key={check.key}
            className={cn("flex items-start gap-2.5 px-3 py-2.5", index > 0 && "border-t border-[var(--line)]")}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                check.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}
            >
              {check.ok ? <Check size={10} strokeWidth={3} /> : <TriangleAlert size={9} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-bold text-[var(--text)]">{check.label}</span>
              <span className="mt-0.5 block text-[10px] leading-relaxed text-[var(--muted)]">{check.desc}</span>
            </span>
          </div>
        ))}
      </div>

      <SectionTitle>此刻被禁用的动作</SectionTitle>
      <div className="space-y-1.5">
        {OBSERVE_BLOCKED_ACTIONS.map((action) => (
          <div key={action.label} className="flex items-start gap-2 rounded-lg bg-[var(--soft-2)] px-3 py-2">
            <Lock size={11} className="mt-0.5 shrink-0 text-[var(--muted-2)]" />
            <p className="text-[10px] leading-relaxed text-[var(--muted)]">
              <strong className="text-[var(--text)]">{action.label}</strong> —— {action.reason}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Step 2 · 建议关停 ───────────────────────────────────────────────────────

function StopPanel({ creative }: { creative: CreativeDiagnosis }) {
  const windows = creative.windows
  const supply = creative.supplyAfterStop
  const supplyShort = supply ? supply.after < supply.min : false

  return (
    <>
      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">连续两个窗口未恢复</span>}>
        止损证据
      </SectionTitle>
      <div className="mb-5 overflow-hidden rounded-xl border border-[var(--line)]">
        <div className="grid grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] gap-2 bg-[var(--soft-2)] px-3 py-2 text-[9.5px] font-extrabold uppercase text-[var(--muted)]">
          <span>窗口</span>
          <span className="text-right">ROI</span>
          <span className="text-right">CTR</span>
          <span className="text-right">CVR</span>
          <span className="text-right">消耗 / 单</span>
        </div>
        {(windows ?? []).map((window) => (
          <div
            key={window.label}
            className="grid grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] items-center gap-2 border-t border-[var(--line)] px-3 py-2.5"
          >
            <span className="truncate text-[10.5px] font-bold text-[var(--text)]">{window.label}</span>
            <strong className="text-right text-[11.5px] tabular-nums text-red-500">{window.roi.toFixed(2)}</strong>
            <span className="text-right text-[10.5px] tabular-nums text-[var(--muted)]">{window.ctr.toFixed(2)}%</span>
            <span className="text-right text-[10.5px] tabular-nums text-[var(--muted)]">{window.cvr.toFixed(2)}%</span>
            <span className="text-right text-[10.5px] tabular-nums text-[var(--muted)]">
              {formatMoney(window.spend)} / {window.orders}
            </span>
          </div>
        ))}
      </div>

      <SectionTitle>影响范围</SectionTitle>
      <ContextTable
        rows={[
          { label: "移出范围", value: "仅当前商品的 GMV Max 素材池", hint: "素材资产保留，不做删除" },
          {
            label: "其他商品",
            value:
              creative.otherProductUsage && creative.otherProductUsage.length > 0
                ? creative.otherProductUsage
                    .map((usage) => `${productById(usage.productId).shortName} ROI ${usage.roi.toFixed(2)}`)
                    .join(" · ")
                : "该素材未用于其他商品",
            hint:
              creative.otherProductUsage && creative.otherProductUsage.length > 0
                ? "这些商品下的投放不受本次关停影响"
                : undefined,
          },
          {
            label: "素材供给",
            value: supply ? `${supply.before} → ${supply.after} 条` : "不变",
            hint: supply ? `健康线 ${supply.min} 条` : undefined,
          },
        ]}
      />

      {supplyShort ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="min-w-0">
            <p className="text-[11.5px] font-extrabold text-amber-900">关停后素材供给将不足</p>
            <p className="mt-0.5 text-[10px] leading-relaxed text-amber-800">
              移出后仅剩 {supply?.after} 条可投素材，低于 {supply?.min} 条的健康线，计划可能进入学习受限。
              建议先补充素材，再执行关停。
            </p>
          </div>
        </div>
      ) : null}

      <p className="mt-3 rounded-lg bg-[var(--soft-2)] px-3 py-2 text-[10px] leading-relaxed text-[var(--muted)]">
        执行时记录 operator、before / after 与 request_id；关停后在任务记录里可随时恢复，不做静默删除。
      </p>
    </>
  )
}

// ─── Step 3 生成结果（支持多轮，时间倒序） ───────────────────────────────────

function GeneratedAssets({
  creative,
  rounds,
  selected,
  generating,
  onToggle,
  onRegenerate,
}: {
  creative: CreativeDiagnosis
  rounds: GenerationRound[]
  selected: string[]
  generating: boolean
  onToggle: (id: string) => void
  onRegenerate: () => void
}) {
  const total = rounds.reduce((sum, item) => sum + item.assets.length, 0)
  const atLimit = selected.length >= MAX_PICK

  return (
    <div className="mb-5">
      <SectionTitle
        action={
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] tabular-nums text-[var(--muted)]">
              选中 {selected.length}/{MAX_PICK} · 共 {total} 条
            </span>
            <Button size="sm" variant="outline" disabled={generating} onClick={onRegenerate}>
              {generating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
              {generating ? "生成中…" : "再次生成"}
            </Button>
          </div>
        }
      >
        可投放的完整新素材
      </SectionTitle>

      <div className="space-y-4">
        {rounds.map((item) => (
          <div key={item.round}>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-[var(--near-black)] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                第 {item.round} 轮
              </span>
              <span className="text-[10px] text-[var(--muted)]">
                {item.at} 生成 · {item.assets.length} 条
              </span>
              {item.round === rounds[0]?.round ? (
                <Badge className="border-0 bg-[var(--lime-soft)] text-[9px] text-[#5c7a00]">最新</Badge>
              ) : null}
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {item.assets.map((asset) => {
                const isSelected = selected.includes(asset.id)
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => onToggle(asset.id)}
                    disabled={atLimit && !isSelected}
                    aria-pressed={isSelected}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-white text-left transition-all",
                      isSelected
                        ? "border-[var(--near-black)] ring-1 ring-[var(--near-black)]/15"
                        : "border-[var(--line)] hover:border-[var(--line-strong)]",
                      atLimit && !isSelected ? "cursor-not-allowed opacity-45" : "cursor-pointer"
                    )}
                  >
                    <span className="relative block aspect-[9/14] overflow-hidden bg-[var(--soft)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.cover} alt={asset.title} className="size-full object-cover" />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[8.5px] font-bold text-white">
                        9:16 · {asset.durationSec}s
                      </span>
                      <span
                        className={cn(
                          "absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-md border transition-colors",
                          isSelected
                            ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--near-black)]"
                            : "border-white/70 bg-black/30 text-transparent"
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="absolute inset-x-1.5 bottom-1.5 truncate text-[9px] font-bold text-white">
                        {asset.category}
                      </span>
                    </span>
                    <span className="block p-2">
                      <span className="block truncate text-[10.5px] font-extrabold text-[var(--text)]">
                        {asset.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] text-[var(--muted)]">
                        {asset.variableLabel} · 其余继承原素材
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
        多轮结果按生成时间倒序排列，可跨轮挑选 · 原素材 {creative.id} 默认继续投放，与新素材同口径对比后才输出胜负
      </p>
    </div>
  )
}

// ─── Step 4 投放配置 ─────────────────────────────────────────────────────────

function NumberField({
  label,
  hint,
  value,
  prefix,
  suffix,
  step,
  min,
  invalid,
  onChange,
}: {
  label: React.ReactNode
  hint?: string
  value: number
  prefix?: string
  suffix?: string
  step?: number
  min?: number
  invalid?: boolean
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold text-[var(--muted)]">{label}</span>
      <span
        className={cn(
          "flex h-10 items-center rounded-lg border bg-white px-3 transition-colors focus-within:border-[var(--near-black)]",
          invalid ? "border-red-300" : "border-[var(--line)]"
        )}
      >
        {prefix ? <span className="mr-1 text-[11px] text-[var(--muted)]">{prefix}</span> : null}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-extrabold tabular-nums outline-none"
        />
        {suffix ? <span className="ml-1 text-[10px] text-[var(--muted)]">{suffix}</span> : null}
      </span>
      {hint ? <span className="mt-1 block text-[9.5px] text-[var(--muted-2)]">{hint}</span> : null}
    </label>
  )
}

function DeliveryConfig({
  productName,
  sku,
  assets,
  originId,
  targetRoi,
  dailyBudget,
  observationHours,
  winOrders,
  stopRoi,
  onTargetRoiChange,
  onDailyBudgetChange,
  onObservationHoursChange,
  onWinOrdersChange,
  onStopRoiChange,
}: {
  productName: string
  sku: string
  assets: GeneratedAsset[]
  originId: string
  targetRoi: number
  dailyBudget: number
  observationHours: number
  winOrders: number
  stopRoi: number
  onTargetRoiChange: (value: number) => void
  onDailyBudgetChange: (value: number) => void
  onObservationHoursChange: (value: number) => void
  onWinOrdersChange: (value: number) => void
  onStopRoiChange: (value: number) => void
}) {
  const stopInvalid = stopRoi <= 0 || stopRoi >= targetRoi

  return (
    <>
      <SectionTitle action={<span className="text-[10px] font-semibold text-[var(--muted)]">对齐 TikTok Product GMV Max</span>}>
        投放配置
      </SectionTitle>
      <div className="mb-5 overflow-hidden rounded-xl border border-[var(--line)]">
        <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
          <div className="bg-white p-3">
            <p className="text-[9.5px] font-semibold text-[var(--muted)]">投放商品</p>
            <p className="mt-1 truncate text-[11.5px] font-extrabold text-[var(--text)]">{productName}</p>
            <p className="mt-0.5 font-mono text-[9.5px] text-[var(--muted)]">{sku}</p>
          </div>
          <div className="bg-white p-3">
            <p className="text-[9.5px] font-semibold text-[var(--muted)]">Optimization mode</p>
            <p className="mt-1 text-[11.5px] font-extrabold text-[var(--text)]">Target ROI</p>
            <p className="mt-0.5 text-[9.5px] text-[var(--muted)]">持续投放，兼顾规模与回报</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-[var(--line)] bg-[var(--soft-2)] p-3">
          <NumberField
            label={
              <>
                目标 ROAS <span className="font-medium">（TikTok Target ROI）</span>
              </>
            }
            value={targetRoi}
            min={0.1}
            step={0.05}
            suffix="x"
            invalid={targetRoi <= 0}
            onChange={onTargetRoiChange}
          />
          <NumberField
            label="每日预算"
            value={dailyBudget}
            min={10}
            step={100}
            prefix="$"
            suffix="USD / 日"
            invalid={dailyBudget < 10}
            onChange={onDailyBudgetChange}
          />
        </div>
      </div>

      <SectionTitle action={<span className="text-[10px] text-[var(--muted)]">时间与样本同时满足才验收</span>}>
        观察与止损规则
      </SectionTitle>
      <div className="mb-3 grid grid-cols-3 gap-3">
        <NumberField
          label="首轮观察"
          value={observationHours}
          min={1}
          step={12}
          suffix="小时"
          invalid={observationHours <= 0}
          onChange={onObservationHoursChange}
        />
        <NumberField
          label="赢家订单线"
          value={winOrders}
          min={1}
          suffix="单"
          invalid={winOrders <= 0}
          onChange={onWinOrdersChange}
        />
        <NumberField
          label="止损 ROI"
          value={stopRoi}
          min={0.1}
          step={0.05}
          suffix="x"
          invalid={stopInvalid}
          hint={stopInvalid ? "必须低于目标 ROAS" : undefined}
          onChange={onStopRoiChange}
        />
      </div>
      <p className="mb-5 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[10px] leading-relaxed text-blue-800">
        观察期内系统只做监控：达到 {observationHours} 小时且订单 ≥ {winOrders} 才判赢；
        连续两个窗口 ROI 低于 {stopRoi.toFixed(2)} 会提醒调整，不会自动关停。
      </p>

      <SectionTitle action={<Badge variant="outline">{assets.length + 1} 条</Badge>}>本次投放素材</SectionTitle>
      <div className="overflow-hidden rounded-xl border border-[var(--line)]">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--soft)] text-[9px] font-bold text-[var(--muted)]">
            原
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-[10.5px] font-bold text-[var(--text)]">{originId}</span>
            <span className="text-[9.5px] text-[var(--muted)]">原素材默认继续投放，用于同口径对比</span>
          </span>
        </div>
        {assets.map((asset, index) => (
          <div key={asset.id} className="flex items-center gap-2.5 border-t border-[var(--line)] px-3 py-2.5">
            <span className="size-8 shrink-0 overflow-hidden rounded-md bg-[var(--soft)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.cover} alt={asset.title} className="size-full object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[10.5px] font-bold text-[var(--text)]">
                V-{String.fromCharCode(65 + index)} · {asset.title}
              </span>
              <span className="text-[9.5px] text-[var(--muted)]">
                第 {asset.round} 轮生成 · {asset.variableLabel}
              </span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2 text-[9.5px] leading-relaxed text-amber-800">
        GMV Max 使用 Target ROI 与每日预算，不是单素材竞价；手动调整 Target ROI 的当天可能影响 Product GMV Max 的 ROI Protection 资格
      </p>
    </>
  )
}

// ─── 唯一主按钮 ──────────────────────────────────────────────────────────────

function PrimaryAction({
  creative,
  phase,
  generating,
  canGenerate,
  pickedCount,
  chosenAssetCount,
  configValid,
  isGenerative,
  reviewWindow,
  onNext,
  onGenerate,
  onOpenConfig,
  onCreateIntent,
  onStop,
  onKeep,
  onOpenDelivery,
}: {
  creative: CreativeDiagnosis
  phase: DrawerPhase
  generating: boolean
  canGenerate: boolean
  pickedCount: number
  chosenAssetCount: number
  configValid: boolean
  isGenerative: boolean
  reviewWindow: number
  onNext: () => void
  onGenerate: () => void
  onOpenConfig: () => void
  onCreateIntent: () => void
  onStop: () => void
  onKeep: () => void
  onOpenDelivery: () => void
}) {
  if (creative.protection) {
    return (
      <Button onClick={onOpenDelivery}>
        <Rocket size={14} />
        查看商品与投放诊断
      </Button>
    )
  }

  if (!isGenerative) {
    if (phase === "diagnose") {
      return (
        <Button variant="primary" onClick={onNext}>
          <ArrowRight size={14} />
          {creative.status === "stop"
            ? "下一步：确认止损"
            : creative.status === "stable"
              ? "下一步：设置复查"
              : "下一步：查看样本进度"}
        </Button>
      )
    }
    if (creative.status === "stop") {
      return (
        <Button variant="destructive" onClick={onStop}>
          <XCircle size={14} />
          确认关停
        </Button>
      )
    }
    return (
      <Button variant="primary" onClick={onKeep}>
        <Check size={14} />
        {creative.status === "stable" ? `创建 ${reviewWindow >= 168 ? "7 天" : `${reviewWindow}h`} 复查任务` : "继续观察"}
      </Button>
    )
  }

  if (phase === "diagnose") {
    return (
      <Button variant="primary" onClick={onNext}>
        <ArrowRight size={14} />
        {creative.status === "scale"
          ? "下一步：选择衍生参考"
          : creative.status === "refresh"
            ? "下一步：选择新方向"
            : "下一步：定位迭代变量"}
      </Button>
    )
  }

  if (phase === "choose") {
    return (
      <Button variant="primary" disabled={!canGenerate || generating} onClick={onGenerate}>
        {generating ? <Loader2 size={14} className="animate-spin" /> : <WandSparkles size={14} />}
        {generating ? "正在生成完整素材…" : pickedCount === 0 ? "先选至少 1 个方案" : `用 ${pickedCount} 个方案生成新素材`}
      </Button>
    )
  }

  if (phase === "assets") {
    return (
      <Button variant="primary" disabled={chosenAssetCount === 0} onClick={onOpenConfig}>
        <Rocket size={14} />
        {chosenAssetCount === 0 ? "先选至少 1 条素材" : `用 ${chosenAssetCount} 条素材配置投放`}
        <ArrowRight size={14} />
      </Button>
    )
  }

  return (
    <Button variant="primary" disabled={!configValid} onClick={onCreateIntent}>
      <Sparkles size={14} />
      保存方案并前往投放中心
      <ArrowRight size={14} />
    </Button>
  )
}
