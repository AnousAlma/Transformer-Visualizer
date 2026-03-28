"use client"

import { useState, useEffect, useRef } from "react"

function MatMulIntro({ tokens, valueVec, onDone }: {
  tokens: string[]
  valueVec: number[]
  onDone: () => void
}) {
  const ROWS = Math.min(tokens.length, 6)  
  const COLS = Math.min(tokens.length, 6)
  const VEC_DIMS = tokens.length                        
  const CELL = 38
  const GAP = 4

  // attention weight values (same formula as main matrix)
  function getWeight(i: number, j: number) {
    if (j > i) return 0
    return Math.abs(Math.sin((i + 1) * (j + 2)))
  }

  // result = weighted sum of value vector rows (simplified: row i = weight[i] * V[i%VEC_DIMS])
  function getResult(i: number) {
    let sum = 0
    for (let j = 0; j <= i && j < COLS; j++) {
      sum += getWeight(i, j) * (valueVec[j % VEC_DIMS] ?? 0)
    }
    return sum
  }

  const [activeRow, setActiveRow] = useState(-1)
  const [activeVecCell, setActiveVecCell] = useState(-1)
  const [filledResults, setFilledResults] = useState<number[]>([])
  const [phase, setPhase] = useState<"animating" | "done">("animating")
  const doneRef = useRef(false)

  useEffect(() => {
    if (!valueVec.length || doneRef.current) return

    let row = 0

    const sweepRow = () => {
      if (row >= ROWS) {
        // pause then call onDone
        setTimeout(() => {
          setPhase("done")
          setTimeout(() => {
            doneRef.current = true
            onDone()
          }, 600)
        }, 500)
        return
      }

      setActiveRow(row)
      setActiveVecCell(-1)

      // sweep through vec dims for this row
      let col = 0
      const colTimer = setInterval(() => {
        setActiveVecCell(col)
        col++
        if (col >= VEC_DIMS) {
          clearInterval(colTimer)
          // fill result cell
          const r = row
          setFilledResults(prev => [...prev, r])
          row++
          setTimeout(sweepRow, 180)
        }
      }, 60)
    }

    const startTimer = setTimeout(sweepRow, 300)
    return () => clearTimeout(startTimer)
  }, [valueVec])

  const opacity = phase === "done" ? 0 : 1

  return (
    <div
      className="flex flex-col items-center gap-8 transition-opacity duration-500"
      style={{ opacity }}
    >
      <div className="text-xs text-zinc-500 tracking-widest uppercase mb-2">
        Computing Attention Output
      </div>

      <div className="flex items-center gap-6">

        {/* ATTENTION WEIGHT MATRIX */}
        <div className="flex flex-col" style={{ gap: GAP }}>
          {/* col labels */}
          <div className="flex" style={{ gap: GAP, paddingLeft: 32 }}>
            {Array.from({ length: COLS }).map((_, j) => (
              <div key={j} style={{ width: CELL, fontSize: 9 }}
                className="text-center text-zinc-600 truncate">
                {tokens[j]?.slice(0, 4)}
              </div>
            ))}
          </div>

          {Array.from({ length: ROWS }).map((_, i) => (
            <div key={i} className="flex items-center" style={{ gap: GAP }}>
              {/* row label */}
              <div style={{ width: 28, fontSize: 9 }}
                className="text-right text-zinc-600 truncate shrink-0 pr-1">
                {tokens[i]?.slice(0, 4)}
              </div>

              {Array.from({ length: COLS }).map((_, j) => {
                const val = getWeight(i, j)
                const isActive = i === activeRow
                const alpha = 0.15 + val * 0.82

                return (
                  <div
                    key={j}
                    className="rounded transition-all duration-150"
                    style={{
                      width: CELL,
                      height: CELL,
                      backgroundColor: j > i
                        ? "rgba(255,255,255,0.03)"
                        : isActive
                        ? `rgba(168,85,247,${alpha})`
                        : `rgba(70,70,90,${alpha * 0.5})`,
                      boxShadow: isActive && j <= i
                        ? `0 0 10px rgba(168,85,247,0.5)`
                        : "none",
                      transform: isActive && j <= i ? "scale(1.07)" : "scale(1)"
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* × */}
        <div className="text-2xl text-zinc-500 font-light shrink-0">×</div>

        {/* VALUE VECTOR (vertical, VEC_DIMS rows × 1 col) */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">V</div>
          {Array.from({ length: VEC_DIMS }).map((_, i) => {
            const val = valueVec[i] ?? 0
            const isActive = i === activeVecCell
            const alpha = 0.15 + Math.min(Math.abs(val), 1) * 0.82

            return (
              <div
                key={i}
                className="rounded transition-all duration-100"
                style={{
                  width: CELL,
                  height: CELL,
                  backgroundColor: `rgba(34,197,94,${alpha})`,
                  boxShadow: isActive ? "0 0 12px rgba(34,197,94,0.8)" : "none",
                  transform: isActive ? "scale(1.12)" : "scale(1)",
                  outline: isActive ? "2px solid rgba(34,197,94,0.6)" : "none"
                }}
              />
            )
          })}
        </div>

        {/* = */}
        <div className="text-2xl text-zinc-500 font-light shrink-0">=</div>

        {/* RESULT VECTOR */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Out</div>
          {Array.from({ length: ROWS }).map((_, i) => {
            const filled = filledResults.includes(i)
            const isJustFilled = filledResults[filledResults.length - 1] === i
            const val = getResult(i)
            const alpha = 0.2 + Math.min(Math.abs(val), 1) * 0.7

            return (
              <div
                key={i}
                className="rounded transition-all duration-300"
                style={{
                  width: CELL,
                  height: CELL,
                  backgroundColor: filled
                    ? `rgba(168,85,247,${alpha})`
                    : "rgba(255,255,255,0.04)",
                  boxShadow: isJustFilled
                    ? "0 0 14px rgba(168,85,247,0.7)"
                    : "none",
                  transform: isJustFilled ? "scale(1.1)" : "scale(1)"
                }}
              />
            )
          })}
        </div>

      </div>
    </div>
  )
}


/* =========================
   Attention Matrix (main view)
========================= */
function AttentionMatrix({
  tokens, selectedToken, visible
}: {
  tokens: string[], selectedToken: number, visible: boolean
}) {
  const size = tokens.length
  function getValue(i: number, j: number) {
    if (j > i) return null
    return Math.abs(Math.sin((i + 1) * (j + 2)))
  }
  const CELL = 32, GAP = 5

  return (
    <div className="flex flex-col transition-all duration-500"
      style={{ gap: GAP, opacity: visible ? 1 : 0, transform: visible ? "translateY(0px)" : "translateY(14px)" }}>
      <div className="flex" style={{ gap: GAP, paddingLeft: 36 }}>
        {tokens.map((t, i) => (
          <div key={i} className="text-center text-zinc-500 truncate" style={{ width: CELL, fontSize: 10 }}>
            {t.slice(0, 4)}
          </div>
        ))}
      </div>
      {Array.from({ length: size }).map((_, i) => (
        <div key={i} className="flex items-center" style={{ gap: GAP }}>
          <div className="text-right text-zinc-500 truncate shrink-0" style={{ width: 28, fontSize: 10 }}>
            {tokens[i]?.slice(0, 4)}
          </div>
          {Array.from({ length: size }).map((_, j) => {
            const val = getValue(i, j)
            const isRow = i === selectedToken
            if (val === null) return (
              <div key={j} className="rounded" style={{ width: CELL, height: CELL, backgroundColor: "rgba(255,255,255,0.03)" }} />
            )
            const alpha = 0.18 + val * 0.82
            return (
              <div key={j} className="rounded transition-all duration-300" style={{
                width: CELL, height: CELL,
                backgroundColor: isRow ? `rgba(168,85,247,${alpha})` : `rgba(80,80,100,${alpha * 0.55})`,
                transform: isRow ? "scale(1.1)" : "scale(1)",
                boxShadow: isRow ? `0 0 8px rgba(168,85,247,${val * 0.6})` : "none"
              }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* =========================
   Vector Heatmap
========================= */
function VectorHeatmap({
  data, color, lookupDim, setLookupDim, visible
}: {
  data: number[], color: string, lookupDim: number | null,
  setLookupDim: (n: number) => void, visible: boolean
}) {
  return (
    <div className="grid transition-all duration-500"
      style={{ gridTemplateColumns: "repeat(8, 1fr)", gap: 5, opacity: visible ? 1 : 0, transform: visible ? "translateY(0px)" : "translateY(14px)" }}>
      {data.map((v, i) => {
        const selected = i === lookupDim
        const alpha = 0.15 + Math.min(Math.abs(v), 1) * 0.85
        return (
          <div key={i} onClick={() => setLookupDim(i)}
            className="rounded cursor-pointer transition-all duration-150"
            style={{
              width: 16, height: 16,
              backgroundColor: `${color}${alpha})`,
              transform: selected ? "scale(1.6)" : "scale(1)",
              boxShadow: selected ? "0 0 8px rgba(255,255,255,0.5)" : "none",
              outline: selected ? "1px solid rgba(255,255,255,0.4)" : "none",
              zIndex: selected ? 10 : 1, position: "relative"
            }} />
        )
      })}
    </div>
  )
}

function generateVector(seedStr: string, length = 64) {
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) seed += seedStr.charCodeAt(i)
  return Array.from({ length }, (_, i) => Math.sin(seed * (i + 1)) * 0.6)
}

/* =========================
   MAIN COMPONENT
========================= */
export default function AttentionOutScreen({
  stepIndex, setStepIndex, inputText, layer
}: {
  stepIndex: number, setStepIndex: (n: number) => void,
  inputText: string, layer: number
}) {
  const [tokens, setTokens] = useState<string[]>([])
  const [selectedToken, setSelectedToken] = useState(0)
  const [valueVec, setValueVec] = useState<number[]>([])
  const [lookupDim, setLookupDim] = useState<number | null>(null)
  const [stage, setStage] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const introShownRef = useRef(false)

  /* TOKEN FETCH */
  useEffect(() => {
    if (!inputText.trim()) return
    const run = async () => {
      const res = await fetch("http://localhost:8000/v1/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, language: "en" })
      })
      const data = await res.json()
      const filtered = data.token_embeddings.filter(
        (te: any) => !te.token.match(/^<\|.*\|>$|^\[.*\]$/)
      )
      setTokens(filtered.map((te: any) => te.token))
      setSelectedToken(0)
    }
    run()
  }, [inputText])

  /* VALUE VECTOR FETCH */
  useEffect(() => {
    if (!tokens.length) return
    const run = async () => {
      const res = await fetch("http://localhost:8000/v1/qkv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText, layer: layer - 1,
          token_positions: [selectedToken], language: "en"
        })
      })
      const data = await res.json()
      if (data.qkv_vectors?.[0]?.value) {
        setValueVec(data.qkv_vectors[0].value.slice(0, 64))
      }
    }
    run()
  }, [tokens, selectedToken, layer, inputText])

  /* STAGE ANIMATION — only after intro is done */
  useEffect(() => {
    if (!tokens.length || showIntro) return
    setStage(0)
    setTimeout(() => setStage(1), 200)
    setTimeout(() => setStage(2), 450)
    setTimeout(() => setStage(3), 700)
    setTimeout(() => setStage(4), 950)
  }, [tokens, selectedToken, showIntro])

  /* intro only plays once on first open */
  const handleIntroDone = () => {
    introShownRef.current = true
    setShowIntro(false)
  }

  const outVec = tokens[selectedToken]
    ? generateVector(tokens[selectedToken] + "_OUT", 64)
    : []
  const lookupV = lookupDim != null ? valueVec[lookupDim] : null

  return (
    <div className="flex w-full gap-10">

      <div className="flex-1 flex flex-col items-center">

        <div className="text-zinc-400 text-base mb-8 tracking-wide">
          APPLY ATTENTION TO PRODUCE OUTPUT
        </div>

        {/* INTRO: matmul animation */}
        {showIntro && tokens.length > 0 && valueVec.length > 0 && (
          <MatMulIntro
            tokens={tokens}
            valueVec={valueVec}
            onDone={handleIntroDone}
          />
        )}

        {/* MAIN VIEW: fades in after intro */}
        <div
          className="w-full flex flex-col items-center transition-opacity duration-500"
          style={{ opacity: showIntro ? 0 : 1, pointerEvents: showIntro ? "none" : "auto" }}
        >
          {/* TOKENS */}
          <div className="flex gap-4 mb-12 flex-wrap justify-center">
            {tokens.map((t, i) => (
              <button key={i} onClick={() => setSelectedToken(i)}
                className={`px-5 py-2.5 rounded-xl border text-sm transition ${
                  i === selectedToken
                    ? "bg-purple-600 border-purple-400 text-white"
                    : "bg-[#111114] border-[#2a2a2e] text-zinc-300 hover:border-zinc-500"
                }`}>
                {t}
              </button>
            ))}
          </div>

          {tokens.length > 0 && (
            <div className="flex flex-col items-center gap-8 w-full">

              <div className="text-sm text-zinc-500">
                Token: <span className="text-purple-400 font-medium">{tokens[selectedToken]}</span>
              </div>

              {/* MATRIX × VALUE VECTOR side by side */}
              <div className="flex items-center gap-5">

                <div className="flex flex-col items-center gap-3">
                  <div className="text-xs text-zinc-500 tracking-widest uppercase">Attention Weights</div>
                  <div className="rounded-2xl p-5 transition-all duration-300"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", opacity: stage >= 1 ? 1 : 0 }}>
                    <AttentionMatrix tokens={tokens} selectedToken={selectedToken} visible={stage >= 1} />
                  </div>
                </div>

                <div className="text-2xl text-zinc-600 transition-all duration-300 mt-6 shrink-0"
                  style={{ opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? "scale(1)" : "scale(0.7)" }}>
                  ×
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-xs text-zinc-500 tracking-widest uppercase">Value (V) — 64 dims</div>
                  <div className="rounded-2xl p-5 transition-all duration-300"
                    style={{
                      background: "rgba(34,197,94,0.04)",
                      border: `1px solid ${stage >= 2 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"}`,
                      opacity: stage >= 2 ? 1 : 0,
                      transform: stage >= 2 ? "translateY(0)" : "translateY(8px)"
                    }}>
                    <VectorHeatmap data={valueVec.length ? valueVec : Array(64).fill(0)}
                      color="rgba(34,197,94," lookupDim={lookupDim} setLookupDim={setLookupDim} visible={stage >= 2} />
                  </div>
                </div>

              </div>

              <div className="text-xl text-zinc-600 transition-all duration-300"
                style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(-6px)" }}>
                ↓
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-zinc-500 tracking-widest uppercase">Attention Output Vector — 64 dims</div>
                <div className="rounded-2xl p-5 transition-all duration-300"
                  style={{
                    background: "rgba(168,85,247,0.04)",
                    border: `1px solid ${stage >= 3 ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)"}`,
                    opacity: stage >= 3 ? 1 : 0,
                    transform: stage >= 3 ? "translateY(0)" : "translateY(8px)"
                  }}>
                  <VectorHeatmap data={outVec.length ? outVec : Array(64).fill(0)}
                    color="rgba(168,85,247," lookupDim={lookupDim} setLookupDim={setLookupDim} visible={stage >= 3} />
                </div>
              </div>

              <div className="flex gap-3 items-center transition-all duration-300"
                style={{ opacity: stage >= 3 ? 1 : 0 }}>
                <input type="number" placeholder="dim" min={0} max={63}
                  className="bg-[#1c1c1f] border border-[#2a2a2e] text-zinc-300 px-3 py-1.5 rounded-lg w-24 text-sm focus:outline-none focus:border-purple-500/50 transition"
                  onChange={(e) => setLookupDim(Number(e.target.value))} />
                {lookupDim != null && (
                  <div className="text-sm text-zinc-400">
                    dim {lookupDim} →
                    <span className="ml-2 text-green-400 font-mono">V {lookupV?.toFixed(3)}</span>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — untouched */}
      <div className="w-[320px] bg-[#111114] border border-[#2a2a2e] rounded-2xl p-6 flex flex-col">
        <div className="text-lg font-semibold mb-4">Attention Output</div>
        <p className="text-sm text-zinc-400 mb-4">Each token attends to previous tokens using attention weights.</p>
        <p className="text-sm text-zinc-400 mb-6">These weights scale the value vectors and are summed to produce the output.</p>
        <div className="bg-[#1a1a1f] rounded-lg px-4 py-3 text-sm text-zinc-300 mb-3">Showing 64 dimensions</div>
        <div className="flex justify-end mt-auto pt-6">
          <button onClick={() => setStepIndex(stepIndex + 1)}
            className="px-5 py-2 rounded-lg text-sm border border-[#2a2a2e] text-zinc-300 hover:bg-[#1c1c22] transition">
            Next →
          </button>
        </div>
      </div>

    </div>
  )
}