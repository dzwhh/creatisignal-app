// 提示词反推卡 —— 翻译下拉的语言列表 & mock 翻译文本
// 共享给 analysis-detail 与 breakdown-step 复用。

export type LangCode =
  | "zh"
  | "en"
  | "es"
  | "pt"
  | "id"
  | "tl"
  | "ja"
  | "ko"
  | "vi"
  | "th"

export const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "zh", label: "中文",            native: "简体中文" },
  { code: "en", label: "English",          native: "English" },
  { code: "es", label: "Español",          native: "Español" },
  { code: "pt", label: "Português",        native: "Português" },
  { code: "id", label: "Bahasa Indonesia", native: "Indonesia" },
  { code: "tl", label: "Tagalog",          native: "Filipino" },
  { code: "ja", label: "日本語",           native: "Japanese" },
  { code: "ko", label: "한국어",            native: "Korean" },
  { code: "vi", label: "Tiếng Việt",       native: "Vietnamese" },
  { code: "th", label: "ภาษาไทย",          native: "Thai" },
]

// Mock 多语翻译版本（仅 en / es / tl 给出完整文案，其它语言演示用 EN）
export const PROMPT_TRANSLATIONS: Partial<Record<LangCode, string>> = {
  en: `Make a 22-second Philippines inclusive-finance short video targeting adults with short-term funding needs who care about repayment pressure and platform compliance.

Shot structure:
- 0–4s: Female host delivers a frontal pain-point question ("Struggling with repayments?") over an overlay of dark-cloud stickers + focus lines.
- 4–9s: Cut to platform UI screenshots, walking through interest rate / credit limit / repayment plan.
- 9–14s: "Focus-line" motion converges onto the brand logo for memorability.
- 14–18s: Legal disclaimer fine print + centered fade-in of license ID.
- 18–22s: CTA "Apply now" + QR code + a closing line of reassurance from the host.

Style & pacing:
- Mid-close shots of the host, warm tones, captions sync to every keyword.
- Pace stages: fast_dense → moderate_escalating → urgent_push.
- Emotion arc: anxiety → relief → trust → urgency.

Selling-point priority: 1) low monthly payment 2) 5-minute funding 3) SEC-licensed compliant.
Don'ts: avoid interest-rate guarantees, avoid competitor comparisons, always keep legal disclaimer.`,
  es: `Crea un video corto de 22 segundos de finanzas inclusivas para Filipinas dirigido a adultos con necesidades de financiamiento a corto plazo, preocupados por la presión de pago y el cumplimiento de la plataforma.

Estructura de tomas:
- 0–4s: Anfitriona presenta una pregunta de dolor frontal ("¿Presión con los pagos?") sobre stickers de nubes + líneas de enfoque.
- 4–9s: Corte a capturas de la UI mostrando tasa / monto / plan de pago.
- 9–14s: Líneas de enfoque convergen al logo de marca.
- 14–18s: Aviso legal en letra pequeña + ID de licencia centrado con fade-in.
- 18–22s: CTA "Solicita ahora" + QR + cierre tranquilizador.

Estilo y ritmo:
- Plano medio-cerrado, tonos cálidos, subtítulos sincronizados.
- Ritmo: fast_dense → moderate_escalating → urgent_push.
- Arco emocional: ansiedad → calma → confianza → urgencia.

Prioridad de beneficios: 1) cuota baja 2) desembolso 5 min 3) licencia SEC.
Evitar: garantizar tasa, comparar competencia, omitir aviso legal.`,
  tl: `Gumawa ng 22-segundo Philippine inclusive-finance short video para sa mga adult na may panandaliang pangangailangan sa pondo at nag-aalala sa repayment at platform compliance.

Shot structure:
- 0–4s: Babaeng host na nagtatanong tungkol sa pain point ("Mahirap ba ang bayaran?") na may dark-cloud stickers + focus lines.
- 4–9s: Lipat sa platform UI screenshots: interes / limit / repayment plan.
- 9–14s: Focus-line motion na nagtatagpo sa brand logo.
- 14–18s: Legal disclaimer fine print + nakacentre na license ID na fade-in.
- 18–22s: CTA "Mag-apply na" + QR + reassuring na pangwakas ng host.

Style & pacing:
- Mid-close shots ng host, mainit na kulay, captions naka-sync.
- Pace: fast_dense → moderate_escalating → urgent_push.
- Emotion arc: pag-aalala → ginhawa → tiwala → urgency.

Selling-point priority: 1) mababang buwanan 2) 5-minuto release 3) SEC-licensed.
Iwasan: mag-promise ng rate, mag-compare ng kakumpitensya, alisin ang legal disclaimer.`,
}

export function translatePrompt(prompt: string, lang: LangCode): string {
  if (lang === "zh") return prompt
  return PROMPT_TRANSLATIONS[lang] ?? PROMPT_TRANSLATIONS.en ?? prompt
}
