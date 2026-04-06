"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import TokenizationScreen from "@/components/TokenizationScreen"
import TokenIDScreen from "@/components/TokenIDScreen"
import Embedding from "@/components/Embedding"
import QKVScreen from "@/components/QKVScreen"
import SelfAttentionScreen from "@/components/SelfAttentionScreen"
import AttentionOutScreen from "@/components/AttentionOutScreen"
import MLPScreen from "@/components/MLPResidual"
import ProbabilitiesScreen from "@/components/OutputScreen"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useLocale } from "next-intl"

import CalculatingProbScreen from "@/components/CalculatingProb"

const localeToLanguage: Record<string, string> = {
  en: "English",
  fr: "French",
  zh: "Chinese",
}

const languageToLocale: Record<string, string> = {
  English: "en",
  French: "fr",
  Chinese: "zh",
}

const localeToBackendLang: Record<string, string> = {
  en: "en",
  fr: "fr",
  zh: "zh",
}

export default function Home() {

  const steps = [
    "Tokenization",
    "Token IDs",
    "Embeddings",
    "QKV",
    "Self-Attention",
    "Attention Out",
    "MLP",
    "Calculating the Probabilities",
    "Output"
  ]

  const locale = useLocale()

  const [stepIndex, setStepIndex] = useState(0)
  const [layer, setLayer] = useState(1)
  const [head, setHead] = useState(0)
  const [inputText, setInputText] = useState("The transformer model processes")
  const [runSignal, setRunSignal] = useState(0)
  const [nLayers, setNLayers] = useState(12)
  const [nHeads, setNHeads] = useState(12)
  const [dModel, setDModel] = useState(768)
  const [vocabSize, setVocabSize] = useState(50257)
  const [modelName, setModelName] = useState("GPT-2")

  const router = useRouter()
  const pathname = usePathname()

  // Derive the display language from the current locale
  const language = localeToLanguage[locale] ?? "English"
  const backendLang = localeToBackendLang[locale] ?? "en"

  // Fetch model info whenever locale changes
  useEffect(() => {
    fetch(`http://localhost:8000/v1/model-info?language=${backendLang}`)
      .then(r => r.json())
      .then(d => {
        setNLayers(d.n_layers)
        setNHeads(d.n_heads)
        setDModel(d.d_model)
        setVocabSize(d.n_vocab)
        setModelName(d.model_name)
        setLayer(1)
      })
      .catch(console.error)
  }, [backendLang])

  const handleLanguageChange = (newLanguage: string) => {
    const newLocale = languageToLocale[newLanguage] ?? "en"
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <main className="min-h-screen bg-[#0f0f10] text-white p-6 flex flex-col gap-6">

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/"
            className="block h-16 w-[220px] bg-left bg-no-repeat bg-contain transition hover:opacity-90"
            style={{ backgroundImage: "url('/full_logo.svg')" }}
            aria-label="Go to home"
          >
            <span className="sr-only text-transparent"></span>
          </Link>

          <a
            href="https://github.com/utmgdsc/Transformer-Visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg border border-[#2a2a2e] bg-[#131316] text-zinc-300 hover:text-white hover:border-[#8d6cff] flex items-center justify-center transition"
            aria-label="Open project on GitHub"
            title="View source on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.57.1.78-.25.78-.55v-2.17c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.2-3.1-.12-.3-.52-1.5.12-3.12 0 0 .98-.32 3.2 1.2a11.1 11.1 0 0 1 5.82 0c2.22-1.52 3.2-1.2 3.2-1.2.64 1.62.24 2.82.12 3.12.75.8 1.2 1.84 1.2 3.1 0 4.44-2.7 5.4-5.27 5.68.42.36.78 1.08.78 2.18v3.23c0 .3.2.66.8.55C20.71 21.37 24 17.07 24 12 24 5.65 18.85.5 12 .5z"/>
            </svg>
          </a>
        </div>

        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#1c1c1f] border border-[#2a2a2e] rounded-xl px-4 py-3 outline-none"
        />

        <button
          onClick={() => {
            setStepIndex(0)
            setRunSignal(prev => prev + 1)
          }}
          className="bg-[#2a2a2e] px-6 py-3 rounded-xl border border-[#3a3a3f] hover:bg-[#333338]"
        >
          ▶ Run
        </button>

        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option>English</option>
          <option>French</option>
          <option>Chinese</option>
        </select>

        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => setLayer(Math.max(1, layer - 1))}
            className="px-2 py-1 text-sm bg-[#1c1c1f] border border-[#2a2a2e] rounded hover:bg-[#2a2a2e]"
          >◀</button>
          <div className="text-sm text-zinc-300 px-3">Layer {layer} / {nLayers}</div>
          <button
            onClick={() => setLayer(Math.min(nLayers, layer + 1))}
            className="px-2 py-1 text-sm bg-[#1c1c1f] border border-[#2a2a2e] rounded hover:bg-[#2a2a2e]"
          >▶</button>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-8">

        <div className="flex flex-col pt-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-start gap-3 relative">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  i < stepIndex ? "bg-green-500 border-green-500" : i === stepIndex ? "border-purple-500" : "border-[#2a2a2e]"
                }`}>
                  {i < stepIndex && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                {i !== steps.length - 1 && (
                  <div className={`w-[2px] h-10 mt-1 ${i < stepIndex ? "bg-green-500" : "bg-[#2a2a2e]"}`} />
                )}
              </div>
              <button
                onClick={() => setStepIndex(i)}
                className={`text-sm text-left transition ${
                  i === stepIndex ? "text-white" : i < stepIndex ? "text-green-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >{s}</button>
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {stepIndex === 0 && <TokenizationScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} runSignal={runSignal} vocabSize={vocabSize} modelName={modelName} />}
          {stepIndex === 1 && <TokenIDScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} dModel={dModel} vocabSize={vocabSize} modelName={modelName} />}
          {stepIndex === 2 && <Embedding stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} dModel={dModel} />}
          {stepIndex === 3 && <QKVScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} layer={layer} setLayer={setLayer} nHeads={nHeads} dModel={dModel} />}
          {stepIndex === 4 && <SelfAttentionScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} layer={layer} head={head} setHead={setHead} nHeads={nHeads} modelName={modelName} />}
          {stepIndex === 5 && <AttentionOutScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} layer={layer} head={head} nHeads={nHeads} dModel={dModel} modelName={modelName} />}
          {stepIndex === 6 && <MLPScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} layer={layer} head={head} nHeads={nHeads} dModel={dModel} />}
          {stepIndex === 7 && <CalculatingProbScreen stepIndex={stepIndex} setStepIndex={setStepIndex} inputText={inputText} nHeads={nHeads} dModel={dModel} vocabSize={vocabSize} />}
          {stepIndex === 8 && <ProbabilitiesScreen inputText={inputText} />}
        </div>

      </div>

    </main>
  )
}