"use client"
import { useState, useEffect } from "react"

function generateVector(seedStr: string, length = 64) {
  let seed = 0
  for (let i = 0; i < seedStr.length; i++) seed += seedStr.charCodeAt(i)
  return Array.from({ length }, (_, i) => Math.sin(seed * (i + 1)) * 0.6)
}

function generateFinalVec(token: string) {
  const attn = generateVector(token + "_ATTN")
  const mlp  = generateVector(token + "_MLP")
  const gelu = mlp.map((x) =>
    0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)))
  )
  return attn.map((v, i) => v + gelu[i])
}

function HeatStrip({ data, color }: { data: number[]; color: string }) {
    return (
      <div className="flex gap-[3px] flex-wrap" style={{ maxWidth: 560 }}>
        {data.map((v, i) => {
          const alpha = 0.12 + Math.min(Math.abs(v), 1) * 0.88
          return (
            <div
              key={i}
              className="rounded-[3px]"
              style={{
                width: 14,
                height: 14,
                backgroundColor: color,
                opacity: alpha,
              }}
            />
          )
        })}
      </div>
    )
  }

function Step({
  number,
  label,
  sublabel,
  color,
  visible,
  delay,
  children,
}: {
  number: string
  label: string
  sublabel: string
  color: string
  visible: boolean
  delay: number
  children: React.ReactNode
}) {
  return (
    <div
      className="flex items-start gap-5 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div
        className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-1"
        style={{ borderColor: color + "66", color }}
      >
        {number}
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-[10px] tracking-[0.18em] text-zinc-500 uppercase">{label}</div>
        {children}
        <div className="text-[11px] text-zinc-600 leading-relaxed max-w-md">{sublabel}</div>
      </div>
    </div>
  )
}

function Connector({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      className="flex items-center gap-3 pl-11 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div className="h-4 w-px bg-zinc-800" />
        <div className="text-[10px] text-zinc-700">{label}</div>
        <div className="h-4 w-px bg-zinc-800" />
      </div>
    </div>
  )
}

export default function CalculatingProbScreen({
  stepIndex,
  setStepIndex,
  inputText,
}: {
  stepIndex: number
  setStepIndex: (n: number) => void
  inputText: string
}) {
  const tokens = inputText.trim().length > 0 ? inputText.split(/\s+/) : ["The"]
  const [selectedToken, setSelectedToken] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    setPhase(0)
    const ts = [150, 500, 860, 1220].map((d, i) => setTimeout(() => setPhase(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [selectedToken])

  useEffect(() => {
    const ts = [150, 500, 860, 1220].map((d, i) => setTimeout(() => setPhase(i + 1), d))
    return () => ts.forEach(clearTimeout)
  }, [])

  const finalVec = generateFinalVec(tokens[selectedToken])

  
  const logitVec = Array.from({ length: 80 }, (_, i) => {
    const v = finalVec[i % finalVec.length]
    return v + Math.sin(i * 0.37 + tokens[selectedToken].length) * 0.3
  })

  const maxL = Math.max(...logitVec)
  const exps = logitVec.map((l) => Math.exp(l - maxL))
  const sumE = exps.reduce((a, b) => a + b, 0)
  const probVec = exps.map((e) => e / sumE * sumE * 0.4) // scale back for visual

  return (
    <div className="flex w-full gap-8 h-full">

      {/* ── LEFT ── */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[11px] tracking-[0.22em] text-zinc-500 uppercase mb-6">
          Calculating Probabilities · Linear Projection + Softmax
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

        <div className="flex flex-col gap-6">

          <Step
            number="1" color="rgb(192,132,252)"
            label="Final Vector of 768 dims (only 64 is displayed)· from MLP block"
            sublabel="The final representation of this token after all transformer layers."
            visible={phase >= 1} delay={0}
          >
            <HeatStrip data={finalVec} color="rgb(192,132,252)" />
          </Step>

          <Connector label="× weight matrix W" visible={phase >= 2} />

          <Step
            number="2" color="rgb(96,165,250)"
            label="Linear Projection · 768 → 50,257 dims (not displaying all)"
            sublabel="The final vector is multiplied by a learned weight matrix, producing one raw score (logit) for every token in the vocabulary."
            visible={phase >= 2} delay={0}
          >
            <HeatStrip data={logitVec} color="rgb(251,191,36)" />
          </Step>

          <Connector label="softmax" visible={phase >= 3} />

          <Step
            number="3" color="rgb(168,85,247)"
            label="Probability Distribution · sums to 1"
            sublabel="Softmax exponentiates every logit and normalises them so all 50,257 values sum to exactly 1 — turning raw scores into valid probabilities."
            visible={phase >= 3} delay={0}
          >
            <HeatStrip data={probVec} color="rgb(168,85,247)" />
          </Step>
          

        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-[280px] shrink-0 bg-[#0e0e11] border border-[#1e1e24] rounded-2xl p-5 flex flex-col gap-5">

        <div>
          <div className="text-sm font-semibold text-zinc-100 mb-1">Linear + Softmax</div>
          <div className="text-xs text-zinc-500 leading-relaxed">
            After all transformer blocks, the final vector is projected into the full vocabulary space and converted into a probability distribution.
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          {[
            { color: "bg-violet-400", label: "Final vector enters from the MLP block" },
            { color: "bg-blue-400",   label: "Linear layer maps it to 50,257 dims , one raw score (logit) per vocab token" },
            { color: "bg-amber-400",  label: "Larger logit = the model thinks that token is more likely next" },
            { color: "bg-purple-400", label: "Softmax normalises all logits into probabilities that sum to 1" },
          ].map(({ color, label }, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-4 h-4 rounded-full ${color} shrink-0 mt-0.5 opacity-80`} />
              <span className="text-zinc-400 leading-relaxed">{label}</span>
            </div>
          ))}
        </div>

        <div className="border border-[#1e1e24] rounded-xl p-3 flex flex-col gap-2">
          <div className="text-[10px] tracking-widest text-zinc-600 uppercase">Why softmax?</div>
          <div className="text-[11px] text-zinc-500 leading-relaxed">
            Logits can be any number, negative or very large. The softmax exponential makes every value positive, and dividing by the sum forces all probabilities to add up to exactly 1.
          </div>
        </div>

        <div className="border-t border-[#1e1e24] pt-4 flex flex-col gap-1">
          <div className="text-[10px] tracking-widest text-zinc-600 uppercase">Vocab size</div>
          <div className="font-mono text-2xl text-zinc-300 font-semibold">50,257</div>
          <div className="text-[11px] text-zinc-600 leading-relaxed">
            Every token in the vocabulary gets a probability. Most collapse to near zero and only a handful compete.
          </div>
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