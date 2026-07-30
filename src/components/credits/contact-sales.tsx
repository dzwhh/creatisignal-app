"use client"

import { Check } from "lucide-react"

const PERKS = [
  "更多团队席位",
  "自定义算力配额",
  "更高自定义并发数",
  "其他个性化需求",
]

/** 套餐与按需自选 tab 底部共用：重度用量的定制化积分方案 */
export function ContactSales() {
  return (
    <section className="rounded-2xl bg-[#131316] overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_300px]">
        {/* 左：主张 */}
        <div className="px-8 py-9">
          <p className="text-[12px] font-bold text-white/40">为重度使用团队量身定制</p>
          <h2 className="mt-3 text-[26px] font-[850] leading-tight text-white">
            完全灵活，按你想要的方式来。
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-white/45 max-w-[560px]">
            自定义积分配额、灵活席位、更高并发、专属支持，完全按你们团队的实际工作方式量身配置。
          </p>
        </div>

        {/* 右：权益清单 + CTA */}
        <div className="px-7 py-9 border-l border-white/[0.08]">
          <p className="text-[12px] text-white/40">包含现有套餐所有能力，以及：</p>
          <ul className="mt-4 space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[13px] text-white/85">
                <Check size={13} strokeWidth={2.6} className="text-[var(--lime)] shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <a
            href="mailto:sales@creatisignal.com?subject=%E5%AE%9A%E5%88%B6%E5%8C%96%E7%A7%AF%E5%88%86%E6%96%B9%E6%A1%88%E5%92%A8%E8%AF%A2"
            className="mt-6 h-10 w-full rounded-full border border-white/20 text-[13px] font-extrabold text-white flex items-center justify-center hover:bg-white/[0.06] hover:border-white/35 transition cursor-pointer"
          >
            联系销售
          </a>
        </div>
      </div>
    </section>
  )
}
