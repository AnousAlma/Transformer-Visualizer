"use client"

import { useState } from "react"

export default function MLPScreen({
  stepIndex,
  setStepIndex,
  inputText
}: {
  stepIndex: number
  setStepIndex: (n: number) => void
  inputText: string
}) {

  const tokens =
    inputText.trim().length > 0
      ? inputText.split(/\s+/)
      : []

  const [selectedToken, setSelectedToken] = useState(0)


  function generateVector(seedStr: string, length = 64) {
    let seed = 0
    for (let i = 0; i < seedStr.length; i++) {
      seed += seedStr.charCodeAt(i)
    }

    return Array.from({ length }, (_, i) =>
      Math.sin(seed * (i + 1)) * 0.6
    )
  }

  const fullAttentionOut = generateVector(tokens[selectedToken] + "_ATTN")
  const fullMLP = generateVector(tokens[selectedToken] + "_MLP")

  const attnVec = fullAttentionOut.slice(0, 4)
  const mlpVec = fullMLP.slice(0, 4)

  const finalVec = attnVec.map((v, i) => v + mlpVec[i])

  return (
    <div className="flex w-full gap-10">

      <div className="flex-1 flex flex-col items-center">

        <div className="text-zinc-400 text-base mb-8 tracking-wide">
          REFINE REPRESENTATION WITH MLP + RESIDUAL
        </div>

        <div className="flex gap-4 mb-12">
          {tokens.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelectedToken(i)}
              className={`px-5 py-2.5 rounded-xl border text-sm transition
              ${
                i === selectedToken
                  ? "bg-purple-600 border-purple-400 text-white"
                  : "bg-[#111114] border-[#2a2a2e] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-10">

          <div className="flex flex-col items-center gap-3">
            <div className="text-sm text-zinc-500">
              Attention Output
            </div>

            <VectorSquares data={attnVec} color="bg-purple-500" />
          </div>

          <div className="text-zinc-500 text-xl">↓</div>

          <div className="flex flex-col items-center gap-3">
            <div className="text-sm text-zinc-500">
              MLP Transformation
            </div>

            <VectorSquares data={mlpVec} color="bg-blue-500" />
          </div>

          <div className="flex items-center gap-6">

            <div className="text-zinc-500 text-2xl">+</div>

            <div className="text-sm text-zinc-500">
              Residual (add input back)
            </div>

          </div>

          <div className="flex flex-col items-center gap-3">

            <div className="text-sm text-zinc-500">
              Final Vector
            </div>

            <VectorSquares data={finalVec} color="bg-purple-400" />

          </div>

        </div>

      </div>

      <div className="w-[320px] bg-[#111114] border border-[#2a2a2e] rounded-2xl p-6 flex flex-col">

        <div>
          <div className="text-lg font-semibold mb-4">
            MLP + Residual
          </div>

          <div className="text-sm text-zinc-400 mb-4 leading-relaxed">
            The MLP transforms the attention output by learning more complex
            patterns and relationships.
          </div>

          <div className="text-sm text-zinc-400 mb-6 leading-relaxed">
            A residual connection then adds the original input back to preserve
            important information and stabilize learning.
          </div>

          <div className="bg-[#1a1a1f] rounded-lg px-4 py-3 text-sm text-zinc-300">
            Showing first 4 of 64 dimensions
          </div>
        </div>

        <div className="flex justify-end mt-auto pt-6">
          <button
            onClick={() => setStepIndex(stepIndex + 1)}
            className="px-5 py-2 rounded-lg text-sm border border-[#2a2a2e] text-zinc-300 hover:bg-[#1c1c22] transition"
          >
            Next →
          </button>
        </div>

      </div>

    </div>
  )
}


function VectorSquares({
  data,
  color
}: {
  data: number[]
  color: string
}) {
  return (
    <div className="flex gap-3">
      {data.map((v, i) => (
        <div
          key={i}
          className={`${color} rounded-lg text-sm px-4 py-2`}
        >
          {v.toFixed(2)}
        </div>
      ))}
    </div>
  )
}