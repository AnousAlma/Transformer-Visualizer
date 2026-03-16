"use client"

import { useState, useEffect } from "react"
import FlowArrow from "./FlowArrow"

export default function SelfAttentionScreen({
  stepIndex,
  setStepIndex,
  inputText,
  layer
}:{
  stepIndex:number
  setStepIndex:(n:number)=>void
  inputText:string
  layer:number
}){

const [tokens,setTokens] = useState<string[]>([])
const [attentionMatrix,setAttentionMatrix] = useState<number[][]>([])

const [queryToken,setQueryToken] = useState(1)
const [head,setHead] = useState(0)

/* reset token when input changes */
useEffect(()=>{
  setQueryToken(1)
},[inputText])

/* fetch attention from backend */
async function fetchAttention(){

  if(!inputText) return

  try{

    const res = await fetch("http://localhost:8000/v1/attention",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        text:inputText,
        layer:layer-1,
        head:head,
        language:"en"
      })
    })

    const data = await res.json()

    setTokens(data.tokens)
    setAttentionMatrix(data.patterns[0].attention_matrix)

  }catch(err){
    console.error("attention fetch failed",err)
  }
}

/* refetch when text or head changes */
useEffect(()=>{
  fetchAttention()
},[inputText,head,layer])

const activeToken = tokens[queryToken] ?? ""

return(

<div className="grid grid-cols-[2fr_1fr] gap-10">

<div className="flex flex-col gap-6">

<p className="text-zinc-400 text-sm">
CLICK A QUERY TOKEN TO SEE HOW MUCH IT ATTENDS TO EACH OTHER TOKEN
</p>

{/* HEAD SWITCH */}
<div className="flex items-center gap-4">

<button
onClick={()=>setHead(Math.max(0, head-1))}
className="px-3 py-1 rounded bg-[#1c1c1f] hover:bg-[#2a2a2e]"
>
◀
</button>

<div className="text-zinc-300 text-sm">
Head {head+1} / 12
</div>

<button
onClick={()=>setHead(Math.min(11, head+1))}
className="px-3 py-1 rounded bg-[#1c1c1f] hover:bg-[#2a2a2e]"
>
▶
</button>

</div>

{/* TOKENS */}
<div className="flex flex-wrap gap-3">

{tokens.slice(1).map((token,i)=>{

const realIndex = i + 1

return(
<button
key={realIndex}
onClick={()=>setQueryToken(realIndex)}
className={`px-4 py-2 rounded-lg ${
queryToken === realIndex
? "bg-purple-600"
: "bg-[#1c1c1f]"
}`}
>
{token}
</button>
)

})}

</div>

<FlowArrow/>

{/* ATTENTION PROCESS */}
<div className="flex items-center justify-center gap-4 text-sm flex-wrap">

<div className="px-3 py-2 bg-red-500/20 text-red-300 rounded font-mono">
Q_{activeToken}
</div>

<div className="text-zinc-500 text-lg">·</div>

<div className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded font-mono">
K_tokensᵀ
</div>

<div className="text-zinc-500 text-lg">→</div>

<div className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded font-mono">
Scores
</div>

<div className="text-zinc-500 text-lg">→</div>

<div className="px-3 py-2 bg-purple-600/30 text-purple-300 rounded font-mono">
Softmax
</div>

</div>

<div className="text-sm text-zinc-400">
Attention weights for "{activeToken}" (Head {head+1})
</div>

{/* ATTENTION BARS */}
<div className="flex flex-col gap-3">

{tokens.slice(1).map((token,i)=>{

const realIndex = i + 1
const value = attentionMatrix[queryToken]?.[realIndex] ?? 0

return(

<div key={realIndex} className="flex items-center gap-4">

<span className="w-20">{token}</span>

<div className="flex-1 h-4 bg-[#1c1c1f] rounded">
<div
className="h-4 bg-purple-500 rounded"
style={{width:`${value*100}%`}}
/>
</div>

<span className="text-zinc-400">
{(value*100).toFixed(1)}%
</span>

</div>

)

})}

</div>

</div>



{/* SIDE PANEL */}
<div className="bg-[#151517] border border-[#2a2a2e] rounded-xl p-6 flex flex-col h-full">

<div className="flex flex-col gap-4">

<h2 className="text-xl font-semibold">
Self-Attention
</h2>

<p className="text-zinc-400 text-sm leading-relaxed">
The Query vector for the selected token is compared with the
Key vectors of every token using a dot product.
The resulting scores are normalized with softmax to produce
attention weights.
</p>

<div className="bg-[#1c1c1f] p-3 rounded text-sm font-mono">
weights = softmax(QKᵀ / √dₖ)
</div>

</div>

<div className="flex justify-end mt-auto pt-6">

<button
onClick={()=>setStepIndex(stepIndex+1)}
className="border border-[#2a2a2e] px-5 py-2 rounded-lg hover:bg-[#1c1c1f]"
>
Next →
</button>

</div>

</div>

</div>

)

}