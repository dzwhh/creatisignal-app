"use client"

/**
 * 引用参考素材弹窗。
 *
 * 详情页里只放平台推荐，想换别的参考从这里挑：左侧常驻上传，右侧按借鉴半径由外到内分 Tab。
 *
 * 这里刻意不套 discovery 的授权门禁（`src/lib/discovery/state.ts` 的 defaultState 是
 * 未授权 / 未配置 / 无追踪品牌，且 session-only）。它只是一个只读的参考选择器，卡在三条
 * 独立授权流后面会直接打断「诊断 → 生成」的主流程，所以三个爆款 Tab 首次打开就有内容，
 * 授权与偏好只作为「扩大候选池」的弱提示。
 */

import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Crosshair, Globe2, Image as ImageIcon, Link2, ShieldCheck, Upload, X } from "lucide-react"
import { useDiscoveryState } from "@/lib/discovery/state"
import { getCompetitorMaterialsByBrand, getMarketHotPicks, getOwnHotPicks } from "@/lib/insights/mock"
import type { Material } from "@/lib/insights/types"
import { OPTION_SOURCE_META, type CreativeOption, type OptionSource } from "@/lib/insights/decision-mock"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VideoCard } from "./decision-ui"

type TabId = "market" | "competitor" | "own" | "uploads" | "link"

const TABS: Array<{ id: TabId; label: string; icon: typeof Globe2 }> = [
  { id: "market", label: "市场爆款", icon: Globe2 },
  { id: "competitor", label: "竞对爆款", icon: Crosshair },
  { id: "own", label: "自有爆款", icon: ShieldCheck },
  { id: "uploads", label: "我的上传", icon: ImageIcon },
  { id: "link", label: "视频链接", icon: Link2 },
]

/** trackedBrands 为空时的兜底品牌，保证竞对 Tab 首开有内容 */
const DEMO_BRAND_SEEDS = ["glossier", "fentybeauty", "cerave"]

function materialToOption(material: Material, source: OptionSource): CreativeOption {
  return {
    key: `${source}-${material.fingerprint}`,
    category: material.videoStyleTag,
    title: material.name,
    desc: `${material.sceneTags.slice(0, 2).join(" / ") || "通用场景"} · ${material.sellingPointTags[0] ?? "综合卖点"}`,
    script: `结构拆解：${material.structureTags.join(" → ") || "Hook → 卖点 → CTA"}。近 7 日 ROI ${material.metrics.roi.toFixed(2)}，CTR ${(material.metrics.ctr * 100).toFixed(2)}%，可直接借用其开场与叙事节奏。`,
    cover: material.thumb,
    source,
  }
}

export function ReferencePickerDialog({
  open,
  onOpenChange,
  max,
  alreadySelected,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 参考总上限（含详情页里已选的） */
  max: number
  alreadySelected: number
  onConfirm: (options: CreativeOption[]) => void
}) {
  const { state } = useDiscoveryState()
  const [tab, setTab] = useState<TabId>("market")
  const [picked, setPicked] = useState<CreativeOption[]>([])
  const [uploads, setUploads] = useState<CreativeOption[]>([])
  const [linkInput, setLinkInput] = useState("")
  const [linkItems, setLinkItems] = useState<CreativeOption[]>([])

  const remaining = Math.max(0, max - alreadySelected - picked.length)
  const atLimit = remaining === 0

  const marketOptions = useMemo(() => getMarketHotPicks(8, "latest").map((item) => materialToOption(item, "market")), [])
  const ownOptions = useMemo(() => getOwnHotPicks(8, "roi").map((item) => materialToOption(item, "own")), [])

  const trackedIds = state.trackedBrands.map((brand) => brand.id).join(",")
  const competitorOptions = useMemo(() => {
    const seeds = trackedIds ? trackedIds.split(",") : DEMO_BRAND_SEEDS
    return seeds.flatMap((seed, brandIndex) =>
      getCompetitorMaterialsByBrand(seed, 3, "played").map((item, index) => ({
        key: `competitor-${seed}-${item.id}`,
        category: ["强反差开场", "达人实测", "痛点反问"][(brandIndex + index) % 3],
        title: `${seed} · 在投素材 ${index + 1}`,
        desc: "竞对近 7 日持续投放中的素材，可借鉴其开场结构",
        script: `来自竞对 ${seed} 的在投素材。建议只借用其开场结构与叙事节奏，商品卖点、Offer 与合规文案必须替换为自有内容。`,
        cover: item.thumb,
        source: "competitor" as const,
      }))
    )
  }, [trackedIds])

  const list =
    tab === "market" ? marketOptions
    : tab === "own" ? ownOptions
    : tab === "competitor" ? competitorOptions
    : tab === "uploads" ? uploads
    : linkItems

  const toggle = (option: CreativeOption) => {
    setPicked((prev) => {
      if (prev.some((item) => item.key === option.key)) return prev.filter((item) => item.key !== option.key)
      if (remaining === 0) return prev
      return [...prev, option]
    })
  }

  const addUpload = () => {
    const index = uploads.length + 1
    const option: CreativeOption = {
      key: `upload-${Date.now()}-${index}`,
      category: "本地上传",
      title: `本地素材 ${index}`,
      desc: "已上传，等待作为参考使用",
      script: "本地上传的参考素材，系统会提取其开场结构与节奏作为生成输入。",
      cover: `https://picsum.photos/seed/upload_${index}/360/640`,
      source: "upload",
    }
    setUploads((prev) => [option, ...prev])
    setTab("uploads")
  }

  const addLink = () => {
    const value = linkInput.trim()
    if (!value) return
    const option: CreativeOption = {
      key: `link-${linkItems.length}-${value.slice(-8)}`,
      category: "视频链接",
      title: "已解析视频",
      desc: value.length > 42 ? `${value.slice(0, 42)}…` : value,
      script: `来自外部链接的参考视频：${value}。系统会解析其开场结构、节奏与画面元素作为生成输入。`,
      cover: `https://picsum.photos/seed/link_${linkItems.length}/360/640`,
      source: "link",
    }
    setLinkItems((prev) => [option, ...prev])
    setLinkInput("")
  }

  const close = () => {
    setPicked([])
    setLinkInput("")
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] flex h-[min(600px,calc(100vh-64px))] w-[min(920px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] border border-[var(--line)] bg-white shadow-[0_32px_96px_rgba(9,9,11,0.26)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <header className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-3.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--soft)] text-[var(--muted)]">
              <ImageIcon size={14} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[14px] font-extrabold text-[var(--text)]">选择参考素材</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-[10.5px] text-[var(--muted)]">
                参考只用于提取开场结构与节奏，商品卖点、Offer 与合规文案不会被引用
              </Dialog.Description>
            </div>
            <span className="shrink-0 tabular-nums text-[11.5px] font-bold text-[var(--muted)]">
              {alreadySelected + picked.length}/{max}
            </span>
            <Dialog.Close
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--text)]"
              aria-label="关闭"
            >
              <X size={14} />
            </Dialog.Close>
          </header>

          <div className="flex min-h-0 flex-1">
            {/* 左侧常驻上传 */}
            <div className="w-[150px] shrink-0 border-r border-[var(--line)] p-3">
              <button
                type="button"
                onClick={addUpload}
                className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line-strong)] text-[var(--muted)] transition-colors hover:border-[var(--near-black)] hover:bg-[var(--soft-2)] hover:text-[var(--text)]"
              >
                <Upload size={20} strokeWidth={1.8} />
                <span className="text-[11px] font-bold">上传本地</span>
                <span className="px-3 text-center text-[9.5px] leading-relaxed text-[var(--muted-2)]">
                  支持 mp4 / mov，也可直接拖拽到这里
                </span>
              </button>
            </div>

            {/* 右侧 Tab + 网格 */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1 border-b border-[var(--line)] px-4 py-2.5">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[11.5px] font-bold transition-colors",
                      tab === id ? "bg-[var(--soft)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    <Icon size={12} strokeWidth={2.2} />
                    {label}
                  </button>
                ))}
              </div>

              {tab === "link" ? (
                <div className="flex items-center gap-2 border-b border-[var(--line)] bg-[var(--soft-2)] px-4 py-2.5">
                  <input
                    value={linkInput}
                    onChange={(event) => setLinkInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && addLink()}
                    placeholder="粘贴 TikTok / 外部视频链接，回车解析"
                    className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-white px-3 text-[11.5px] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line-strong)]"
                  />
                  <Button size="sm" variant="outline" disabled={!linkInput.trim()} onClick={addLink}>
                    解析
                  </Button>
                </div>
              ) : null}

              {tab === "competitor" && state.trackedBrands.length === 0 ? (
                <p className="border-b border-[var(--line)] bg-amber-50/60 px-4 py-2 text-[10px] text-amber-800">
                  当前展示的是示例品牌的在投素材 · 在「竞对追踪」里添加品牌可扩大候选池
                </p>
              ) : null}
              {tab === "market" && !state.marketPrefs.configured ? (
                <p className="border-b border-[var(--line)] bg-blue-50/60 px-4 py-2 text-[10px] text-blue-800">
                  未设置国家 / 品类偏好，当前按全行业热度推荐 · 设置后可按你的品类精准筛选
                </p>
              ) : null}
              {tab === "own" && !state.ownAds.authorized ? (
                <p className="border-b border-[var(--line)] bg-blue-50/60 px-4 py-2 text-[10px] text-blue-800">
                  未关联广告平台，当前展示的是已同步账户的历史素材 · 关联后可覆盖全部投放数据
                </p>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {list.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--soft)] text-[var(--muted-2)]">
                      <ImageIcon size={19} strokeWidth={1.8} />
                    </span>
                    <p className="text-[12px] font-bold text-[var(--text)]">
                      {tab === "uploads" ? "还没有上传过素材" : "还没有解析过链接"}
                    </p>
                    <p className="text-[10.5px] text-[var(--muted)]">
                      {tab === "uploads" ? "点击左侧「上传本地」添加参考视频" : "在上方粘贴视频链接并回车"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5">
                    {list.map((option) => {
                      const selected = picked.some((item) => item.key === option.key)
                      return (
                        <VideoCard
                          key={option.key}
                          cover={option.cover}
                          category={option.category}
                          title={option.title}
                          desc={option.desc}
                          script={option.script}
                          sourceLabel={OPTION_SOURCE_META[option.source].label}
                          sourceClassName={OPTION_SOURCE_META[option.source].className}
                          selected={selected}
                          disabled={atLimit}
                          onToggle={() => toggle(option)}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-3">
            <span className="text-[10.5px] text-[var(--muted)]">
              {atLimit ? `已达上限 ${max} 条，取消选择后可继续挑` : `还可以选 ${remaining} 条`}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={close}>
                取消
              </Button>
              <Button
                variant="primary"
                disabled={picked.length === 0}
                onClick={() => {
                  onConfirm(picked)
                  close()
                }}
              >
                引用 {picked.length} 条
              </Button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
