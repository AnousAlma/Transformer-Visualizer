"use client"
import FlowArrow from "./FlowArrow"

import { useState } from "react"

export default function Embedding(
    {
        stepIndex,
        setStepIndex
      }: {
        stepIndex: number
        setStepIndex: (n: number) => void
      }
) {

  const tokens = ["The", "transformer", "model", "processes"]
  const [selectedToken, setSelectedToken] = useState(0)

  const embedding = [
    -0.91, -0.42, 0.87, -0.73, 0.44, 0.22,
    0.93, 0.23, 0.68, -0.11
  ]

  return (

    <div className="grid grid-cols-[2fr_1fr] gap-10">

      {/* LEFT SIDE */}
      <div className="flex flex-col items-center gap-8">

        <div className="text-zinc-400 text-sm text-center">
          CLICK A TOKEN TO INSPECT ITS EMBEDDING VECTOR
        </div>

        {/* TOKEN SELECTOR */}
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl">

          {tokens.map((t,i)=>(
            <button
              key={i}
              onClick={()=>setSelectedToken(i)}
              className={`min-w-[110px] px-4 py-2 rounded-lg border ${
                selectedToken === i
                ? "bg-purple-600 border-purple-600"
                : "border-[#2a2a2e]"
              }`}
            >
              {t}
            </button>
          ))}

        </div>

        <FlowArrow />

        <div className="text-sm text-zinc-400 text-center">
          VECTOR FOR "{tokens[selectedToken].toUpperCase()}" — 768 DIMS, SHOWING 10
        </div>


        {/* VECTOR BARS */}
        <div className="flex flex-col gap-3 w-full max-w-3xl">

          {embedding.map((v,i)=>{

            const width = Math.abs(v) * 100
            const color = v >= 0 ? "bg-purple-500" : "bg-orange-400"

            return (
              <div key={i} className="flex items-center gap-4">

                <div className="w-16 text-zinc-400">
                  dim {i}
                </div>

                <div className="flex-1 h-4 bg-[#1c1c1f] rounded">
                  <div
                    className={`h-4 rounded ${color}`}
                    style={{width:`${width}%`}}
                  />
                </div>

                <div className="w-12 text-right text-zinc-400">
                  {v.toFixed(2)}
                </div>

              </div>
            )

          })}

        </div>

      </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#151517] border border-[#2a2a2e] rounded-xl p-6 flex flex-col">

        <div className="flex flex-col gap-4">

        <h2 className="text-xl font-semibold">
            Embeddings
        </h2>

        <p className="text-zinc-400 text-sm leading-relaxed">
            A learned matrix converts each ID into a dense vector. Similar words end up
            with similar vectors.
        </p>

        <div className="bg-[#1c1c1f] p-3 rounded text-sm font-mono">
            E = Lookup(id) <br/>
            X ∈ ℝ^(4×768)
        </div>

        <div className="border-l-2 border-purple-500 pl-4 text-zinc-400 text-sm">
            Purple bars = positive dims, orange = negative. Intensity shows magnitude.
        </div>

        </div>

        {/* NEXT BUTTON */}
        <div className="flex justify-end mt-auto pt-6">

        <button
            onClick={() => setStepIndex(stepIndex + 1)}
            className="border border-[#2a2a2e] px-5 py-2 rounded-lg hover:bg-[#1c1c1f]"
        >
            Next →
        </button>

        </div>

</div>


      
    </div>

  )
}