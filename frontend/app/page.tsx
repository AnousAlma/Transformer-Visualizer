"use client"

import { useState } from "react"

import TokenizationScreen from "@/components/TokenizationScreen"
import TokenIDScreen from "@/components/TokenIDScreen"
import Embedding from "@/components/Embedding"
import QKVScreen from "@/components/QKVScreen"
import SelfAttentionScreen from "@/components/SelfAttentionScreen"

export default function Home() {

  const steps = [
    "Tokenization",
    "Token IDs",
    "Embeddings",
    "QKV",
    "Self-Attention",
    "MLP",
    "Output"
  ]

  const [stepIndex, setStepIndex] = useState(4)

  return (

    <main className="min-h-screen bg-[#0f0f10] text-white p-8 flex flex-col gap-6">

      {/* INPUT */}
      <div className="flex gap-4 items-center">
        <input
          className="flex-1 bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl px-4 py-3 outline-none"
          defaultValue="hi"
        />

        <button className="bg-[#2a2a2e] px-6 py-3 rounded-xl border border-[#3a3a3f] hover:bg-[#333338]">
          ▶ Run
        </button>
      </div>


      {/* STEPS */}
    <div className="flex items-center border-b border-[#2a2a2e] pb-4">

    {steps.map((s, i) => (
      <div key={s} className="flex items-center">

        <Step
          label={s}
          done={i < stepIndex}
          active={i === stepIndex}
          onClick={() => setStepIndex(i)}
        />

        {/* CONNECTOR LINE */}
        { i !== steps.length - 1 && (
        <div
          className={`w-10 h-[2px] mx-2 transition-colors ${
            i < stepIndex ? "bg-green-500" : "bg-[#2a2a2e]"
          }`}
        ></div>
      )}

      </div>
    ))}

    </div>


      {/* SCREEN SWITCHER */}

      {stepIndex === 0 && (
      <TokenizationScreen stepIndex={stepIndex} setStepIndex={setStepIndex} />
      )}

      {stepIndex === 1 && (
      <TokenIDScreen stepIndex={stepIndex} setStepIndex={setStepIndex} />
      )}

      {stepIndex === 2 && (
      <Embedding stepIndex={stepIndex} setStepIndex={setStepIndex} />
      )}

      {stepIndex === 3 && (
      <QKVScreen stepIndex={stepIndex} setStepIndex={setStepIndex} />
      )}

      {stepIndex === 4 && (
      <SelfAttentionScreen stepIndex={stepIndex} setStepIndex={setStepIndex} />
)}

    </main>
  )
}


function Step({
  label,
  done,
  active,
  onClick,
}: {
  label: string
  done?: boolean
  active?: boolean
  onClick?: () => void
}) {

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm transition ${
        active
          ? "border-white"
          : "border-[#2a2a2e] text-zinc-400 hover:border-zinc-500"
      }`}
    >
      {done && "✓ "} {label}
    </button>
  )
}