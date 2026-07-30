/* eslint-disable @next/next/no-img-element */
import { Heart, Radar, Play } from "lucide-react"
import { getCompetitorMaterialsByBrand } from "@/lib/insights/mock"
import { formatScore } from "@/lib/competitors/mock"

function seededStats(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return {
    likes: 12_000 + (h % 220_000),
    score: 800 + (h % 42_000),
  }
}

export function TopMaterials({ brandId, collecting = false }: { brandId: string; collecting?: boolean }) {
  const materials = getCompetitorMaterialsByBrand(brandId, 3, "engaged")
  const placeholders = Math.max(0, 3 - materials.length)
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-extrabold text-[var(--text)]">核心投放素材</h2>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5">互动表现 TOP {materials.length || 3}</p>
        </div>
        <span className="h-[22px] px-2.5 rounded-full bg-[var(--lime-soft)] text-[10.5px] font-extrabold text-[#3f6212] flex items-center gap-1">
          {collecting && <span className="w-1 h-1 rounded-full bg-[#3f6212] animate-pulse" />}
          {collecting ? `采集中 · TOP ${materials.length || 3}` : "活跃投放中"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {materials.map((m, i) => {
          const stats = seededStats(m.id)
          return (
            <div
              key={m.id}
              className="group relative rounded-xl overflow-hidden bg-[#eceef2] aspect-[16/10] cursor-pointer ring-1 ring-black/[0.04]"
            >
              <img
                src={m.thumb}
                alt={`素材 ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              {/* hover 播放态 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center text-white">
                  <Play size={15} strokeWidth={2.4} fill="currentColor" className="ml-0.5" />
                </span>
              </div>
              {/* 常驻底部渐隐 + 互动数据 */}
              <div className="absolute inset-x-0 bottom-0 h-[64px] bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-3 text-white">
                <span className="flex items-center gap-1 text-[11.5px] font-extrabold tabular-nums">
                  <Heart size={11} strokeWidth={2.4} className="text-[var(--lime)]" />
                  {formatScore(stats.likes)}
                </span>
                <span className="flex items-center gap-1 text-[11.5px] font-extrabold tabular-nums">
                  <Radar size={11} strokeWidth={2.4} className="text-[var(--lime)]" />
                  {formatScore(stats.score)}
                </span>
                <span className="ml-auto text-[10.5px] font-bold text-white/70 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  查看素材
                </span>
              </div>
              <span
                className={
                  i === 0
                    ? "absolute top-2.5 left-2.5 h-[22px] px-2.5 rounded-full bg-[var(--lime)] text-[#20251a] text-[10.5px] font-extrabold flex items-center"
                    : "absolute top-2.5 left-2.5 h-[22px] px-2.5 rounded-full bg-black/55 backdrop-blur text-white text-[10.5px] font-extrabold flex items-center"
                }
              >
                TOP {i + 1}
              </span>
            </div>
          )
        })}
        {/* 不足 3 条时用扫描线占位,而不是留白 —— dh-scan 就是为这个写的 */}
        {Array.from({ length: placeholders }, (_, p) => (
          <div
            key={`ph-${p}`}
            className="relative rounded-xl overflow-hidden bg-[var(--soft)] aspect-[16/10] ring-1 ring-black/[0.04] flex items-center justify-center"
          >
            <span
              className="absolute left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,#84cc16,transparent)]"
              style={{ animation: "dh-scan 2.2s ease-in-out infinite" }}
            />
            <span className="relative text-[11.5px] font-bold text-[var(--muted-2)]">
              正在采集第 {materials.length + p + 1} 条
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
