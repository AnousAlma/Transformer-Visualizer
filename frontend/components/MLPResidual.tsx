"use client"
import { useState, useEffect, useRef } from "react"

function generateVector(seedStr: string, length = 64) {
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) seed += seedStr.charCodeAt(i)
  return Array.from({ length }, (_, i) => Math.sin(seed * (i + 1)) * 0.6)
}

function gelu(x: number) {
  // approximate GELU
  return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)))
}

function HeatStrip({
  data,
  color,
  highlightIdx,
  onHover,
  label,
  visible = true,
}: {
  data: number[]
  color: [number, number, number]
  highlightIdx: number | null
  onHover: (i: number | null) => void
  label: string
  visible?: boolean
}) {
  const [r, g, b] = color
  return (
    <div
      className="flex flex-col gap-2 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}
    >
      <div className="text-[10px] tracking-[0.18em] text-zinc-500 uppercase">{label}</div>
      <div className="flex gap-[3px] flex-wrap" style={{ maxWidth: 560 }}>
        {data.map((v, i) => {
          const alpha = 0.12 + Math.min(Math.abs(v), 1) * 0.88
          const isHot = i === highlightIdx
          return (
            <div
              key={i}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              className="rounded-[3px] cursor-crosshair transition-all duration-100"
              style={{
                width: 14,
                height: 14,
                backgroundColor: `rgba(${r},${g},${b},${alpha})`,
                transform: isHot ? "scale(1.7)" : "scale(1)",
                boxShadow: isHot ? `0 0 8px rgba(${r},${g},${b},0.8)` : "none",
                outline: isHot ? `1px solid rgba(${r},${g},${b},0.7)` : "none",
                zIndex: isHot ? 10 : 1,
                position: "relative",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function GeluCurve({ highlightX }: { highlightX: number | null }) {
  const W = 200, H = 80
  const xMin = -3, xMax = 3
  const yMin = -0.5, yMax = 1.5

  function toSVG(x: number, y: number) {
    const px = ((x - xMin) / (xMax - xMin)) * W
    const py = H - ((y - yMin) / (yMax - yMin)) * H
    return [px, py]
  }

  const points: string[] = []
  for (let xi = 0; xi <= 100; xi++) {
    const x = xMin + (xi / 100) * (xMax - xMin)
    const y = gelu(x)
    const [px, py] = toSVG(x, y)
    points.push(`${px},${py}`)
  }

  let dotEl = null
  if (highlightX !== null) {
    const clampedX = Math.max(xMin, Math.min(xMax, highlightX * 3))
    const y = gelu(clampedX)
    const [px, py] = toSVG(clampedX, y)
    dotEl = <circle cx={px} cy={py} r={4} fill="rgba(52,211,153,1)" />
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] tracking-widest text-zinc-600 uppercase">GELU activation</div>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        {/* axes */}
        <line x1={0} y1={H * (1.5 / 2)} x2={W} y2={H * (1.5 / 2)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        {/* curve */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="rgba(52,211,153,0.7)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {dotEl}
      </svg>
    </div>
  )
}

function MLPFlow({
  attnVec,
  mlpVec,
  geluVec,
  finalVec,
  hoverIdx,
  setHoverIdx,
  phase,
}: {
  attnVec: number[]
  mlpVec: number[]
  geluVec: number[]
  finalVec: number[]
  hoverIdx: number | null
  setHoverIdx: (i: number | null) => void
  phase: number
}) {
  const hVal = hoverIdx !== null ? attnVec[hoverIdx] : null

  return (
    <div className="flex flex-col gap-8 items-start w-full">

      {/* step 1 — attention out */}
      <div className="flex items-center gap-5 w-full">
        <div className="w-6 h-6 rounded-full border border-purple-500/40 flex items-center justify-center text-[10px] text-purple-400 shrink-0">1</div>
        <HeatStrip
          data={attnVec} color={[168, 85, 247]} highlightIdx={hoverIdx}
          onHover={setHoverIdx} label="Attention Output  ·  64 dims" visible={phase >= 1}
        />
      </div>

      {/* arrow + label */}
      <div className="flex items-center gap-3 pl-11 transition-all duration-500" style={{ opacity: phase >= 2 ? 1 : 0 }}>
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-[10px] text-zinc-600">Linear (W₁)</div>
          <div className="h-5 w-px bg-zinc-700" />
        </div>
      </div>

      {/* step 2 — linear out */}
      <div className="flex items-center gap-5 w-full transition-all duration-500" style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "translateY(0)" : "translateY(10px)" }}>
        <div className="w-6 h-6 rounded-full border border-blue-500/40 flex items-center justify-center text-[10px] text-blue-400 shrink-0">2</div>
        <HeatStrip
          data={mlpVec} color={[59, 130, 246]} highlightIdx={hoverIdx}
          onHover={setHoverIdx} label="After Linear Layer  ·  64 dims" visible={phase >= 2}
        />
      </div>

      {/* arrow + GELU */}
      <div className="flex items-start gap-6 pl-11 transition-all duration-500" style={{ opacity: phase >= 3 ? 1 : 0 }}>
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-[10px] text-zinc-600">GELU</div>
          <div className="h-5 w-px bg-zinc-700" />
        </div>
        <GeluCurve highlightX={hVal} />
      </div>

      {/* step 3 — after GELU */}
      <div className="flex items-center gap-5 w-full transition-all duration-500" style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "translateY(0)" : "translateY(10px)" }}>
        <div className="w-6 h-6 rounded-full border border-emerald-500/40 flex items-center justify-center text-[10px] text-emerald-400 shrink-0">3</div>
        <HeatStrip
          data={geluVec} color={[52, 211, 153]} highlightIdx={hoverIdx}
          onHover={setHoverIdx} label="After GELU  ·  64 dims" visible={phase >= 3}
        />
      </div>

      {/* arrow residual */}
      <div className="flex items-center gap-3 pl-11 transition-all duration-500" style={{ opacity: phase >= 4 ? 1 : 0 }}>
        <div className="flex flex-col items-center gap-1">
          <div className="h-5 w-px bg-zinc-700" />
          <div className="text-[10px] text-zinc-600">+ Residual</div>
          <div className="h-5 w-px bg-zinc-700" />
        </div>
        {/* residual badge */}
        <div className="text-[10px] text-zinc-500 border border-zinc-700 rounded px-2 py-1">
          add attention output back
        </div>
      </div>

      {/* step 4 — final */}
      <div className="flex items-center gap-5 w-full transition-all duration-500" style={{ opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? "translateY(0)" : "translateY(10px)" }}>
        <div className="w-6 h-6 rounded-full border border-violet-400/60 bg-violet-500/10 flex items-center justify-center text-[10px] text-violet-300 shrink-0">4</div>
        <HeatStrip
          data={finalVec} color={[192, 132, 252]} highlightIdx={hoverIdx}
          onHover={setHoverIdx} label="Final Vector  ·  64 dims" visible={phase >= 4}
        />
      </div>

    </div>
  )
}

export default function MLPScreen({
  stepIndex,
  setStepIndex,
  inputText,
}: {
  stepIndex: number
  setStepIndex: (n: number) => void
  inputText: string
}) {
  const tokens = inputText.trim().length > 0 ? inputText.split(/\s+/) : []
  const [selectedToken, setSelectedToken] = useState(0)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [phase, setPhase] = useState(0)
  const prevToken = useRef(-1)

  useEffect(() => {
    if (prevToken.current === selectedToken) return
    prevToken.current = selectedToken
    setPhase(0)
    const t1 = setTimeout(() => setPhase(1), 120)
    const t2 = setTimeout(() => setPhase(2), 420)
    const t3 = setTimeout(() => setPhase(3), 760)
    const t4 = setTimeout(() => setPhase(4), 1100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [selectedToken])

  // kick off on first render
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 150)
    const t2 = setTimeout(() => setPhase(2), 450)
    const t3 = setTimeout(() => setPhase(3), 800)
    const t4 = setTimeout(() => setPhase(4), 1150)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  const attnVec = generateVector(tokens[selectedToken] + "_ATTN")
  const mlpVec  = generateVector(tokens[selectedToken] + "_MLP")
  const geluVec = mlpVec.map(gelu)
  const finalVec = attnVec.map((v, i) => v + geluVec[i])

  const hoveredValues = hoverIdx !== null ? {
    attn:  attnVec[hoverIdx],
    mlp:   mlpVec[hoverIdx],
    gelu:  geluVec[hoverIdx],
    final: finalVec[hoverIdx],
  } : null

  return (
    <div className="flex w-full gap-8 h-full">

      {/* ── LEFT: main flow ── */}
      <div className="flex-1 flex flex-col min-h-0">

        <div className="text-[11px] tracking-[0.22em] text-zinc-500 uppercase mb-6">
          Refine Representation · MLP + Residual
        </div>

        {/* token pills */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {tokens.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelectedToken(i)}
              className={`px-4 py-2 rounded-xl border text-sm font-mono transition-all duration-200 ${
                i === selectedToken
                  ? "bg-purple-600/90 border-purple-400/60 text-white shadow-[0_0_14px_rgba(168,85,247,0.4)]"
                  : "bg-[#111114] border-[#2a2a2e] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* flow */}
        <div className="overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 260px)" }}>
          <MLPFlow
            attnVec={attnVec}
            mlpVec={mlpVec}
            geluVec={geluVec}
            finalVec={finalVec}
            hoverIdx={hoverIdx}
            setHoverIdx={setHoverIdx}
            phase={phase}
          />
        </div>
      </div>

      {/* ── RIGHT: info panel ── */}
      <div className="w-[290px] shrink-0 bg-[#0e0e11] border border-[#1e1e24] rounded-2xl p-5 flex flex-col gap-5">

        <div>
          <div className="text-sm font-semibold text-zinc-100 mb-1">MLP + Residual</div>
          <div className="text-xs text-zinc-500 leading-relaxed">
            Each token's attention output passes through a two-layer MLP that learns complex non-linear patterns.
          </div>
        </div>

        {/* steps legend */}
        <div className="flex flex-col gap-3 text-xs">
          {[
            { n: 1, color: "bg-purple-500", label: "Attention output enters" },
            { n: 2, color: "bg-blue-500",   label: "Linear layer (W₁ · x + b)" },
            { n: 3, color: "bg-emerald-400", label: "GELU activation — lets small values pass partially, large values fully" },
            { n: 4, color: "bg-violet-400",  label: "Residual add — preserves earlier info" },
          ].map(({ n, color, label }) => (
            <div key={n} className="flex items-start gap-2.5">
              <div className={`w-4 h-4 rounded-full ${color} shrink-0 mt-0.5 opacity-80`} />
              <span className="text-zinc-400 leading-relaxed">{label}</span>
            </div>
          ))}
        </div>

        {/* hover inspector */}
        <div className="border-t border-[#1e1e24] pt-4">
          <div className="text-[10px] tracking-widest text-zinc-600 uppercase mb-3">Dim Inspector</div>
          {hoveredValues ? (
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-600">dim {hoverIdx}</span>
              </div>
              {[
                { label: "Attn", val: hoveredValues.attn,  color: "text-purple-400" },
                { label: "Linear", val: hoveredValues.mlp, color: "text-blue-400" },
                { label: "GELU", val: hoveredValues.gelu,  color: "text-emerald-400" },
                { label: "Final", val: hoveredValues.final, color: "text-violet-300" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-zinc-600">{label}</span>
                  <span className={`${color} tabular-nums`}>{val.toFixed(4)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-zinc-700">
              hover any cell to inspect values through each stage
            </div>
          )}
        </div>

        <div className="mt-auto flex justify-end">
          <button
            onClick={() => setStepIndex(stepIndex + 1)}
            className="px-4 py-2 rounded-lg text-xs border border-[#2a2a2e] text-zinc-400 hover:bg-[#1a1a20] hover:text-zinc-200 transition"
          >
            Next →
          </button>
        </div>
      </div>

    </div>
  )
}