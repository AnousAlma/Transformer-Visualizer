"use client"

export default function ProbabilitiesScreen({
  inputText
}: {
  inputText: string
}) {

  const tokens =
    inputText.trim().length > 0
      ? inputText.split(/\s+/)
      : []

  const lastToken = tokens[tokens.length - 1]


  function generateVector(seedStr: string, length = 64) {
    let seed = 0
    for (let i = 0; i < seedStr.length; i++) {
      seed += seedStr.charCodeAt(i)
    }

    return Array.from({ length }, (_, i) =>
      Math.sin(seed * (i + 1)) * 0.6
    )
  }

  const finalVec = generateVector(lastToken + "_FINAL").slice(0, 4)


  const vocab = [
    "visualize",
    "create",
    "see",
    "make",
    "easily",
    "quickly",
    "explore",
    "build"
  ]


  const logits = vocab.map((word, i) =>
    Math.sin((i + 1) * finalVec[0] * 5)
  )


  function softmax(arr: number[]) {
    const max = Math.max(...arr)
    const exps = arr.map(v => Math.exp(v - max))
    const sum = exps.reduce((a, b) => a + b, 0)
    return exps.map(v => v / sum)
  }

  const probs = softmax(logits)


  const sorted = vocab
    .map((word, i) => ({
      word,
      prob: probs[i]
    }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 5)

  const topWord = sorted[0].word

  return (
    <div className="flex w-full gap-10">

      <div className="flex-1 flex flex-col items-center">

        <div className="text-zinc-400 text-base mb-8 tracking-wide">
          PREDICT NEXT WORD
        </div>

        <div className="text-lg text-zinc-300 mb-10 text-center">
          {tokens.join(" ")}
        </div>

        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="text-sm text-zinc-500">
            Model understanding of the sentence (Not showing all Dimensions)
          </div>

          <VectorSquares data={finalVec} color="bg-purple-500" />
        </div>

        <div className="w-full max-w-md flex flex-col gap-3 mb-10">

          {sorted.map((item, i) => (
            <div key={i} className="flex items-center gap-3">

              <div className={`w-28 text-sm ${
                i === 0 ? "text-purple-400 font-medium" : "text-zinc-300"
              }`}>
                {item.word}
              </div>

              <div className="flex-1 h-2 bg-[#1c1c22] rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    i === 0 ? "bg-purple-500" : "bg-zinc-500"
                  }`}
                  style={{ width: `${item.prob * 100}%` }}
                />
              </div>

              <div className="text-xs text-zinc-400 w-12 text-right">
                {(item.prob * 100).toFixed(1)}%
              </div>

            </div>
          ))}

        </div>

        <div className="w-full max-w-md flex flex-col gap-3">

          <div className="text-sm text-zinc-500 mb-2">
            Possible continuations
          </div>

          {sorted.map((item, i) => (
            <div
              key={i}
              className={`text-sm px-4 py-2 rounded-lg border transition
              ${
                i === 0
                  ? "border-purple-500 bg-purple-500/10 text-purple-300"
                  : "border-[#2a2a2e] text-zinc-300"
              }`}
            >
              {tokens.join(" ")}{" "}
              <span className="font-medium">{item.word}</span>
              <span className="ml-2 text-xs text-zinc-400">
                ({(item.prob * 100).toFixed(1)}%)
              </span>
            </div>
          ))}

        </div>

      </div>

      <div className="w-[320px] bg-[#111114] border border-[#2a2a2e] rounded-2xl p-6 flex flex-col">

        <div>
          <div className="text-lg font-semibold mb-4">
            Next Token Prediction
          </div>

          <div className="text-sm text-zinc-400 mb-4 leading-relaxed">
            The model uses the final representation of the last token to
            predict what word comes next.
          </div>

          <div className="text-sm text-zinc-400 leading-relaxed">
            The highest probability word is selected as the output.
          </div>
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