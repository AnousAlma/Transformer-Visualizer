""" API endpoints for hallucination metrics
"""
from dotenv import load_dotenv
load_dotenv()

from fastapi import APIRouter, HTTPException
from deepeval.models import LiteLLMModel
from deepeval.test_case import LLMTestCase
from deepeval.metrics import GEval
from deepeval.test_case import LLMTestCaseParams
from schemas import LLMJudgeRequest, LLMJudgeResponse
import os

router = APIRouter(prefix="/v1", tags=["llmjudge"])  
groq_key=os.environ.get("GROQ_API_KEY")
if not groq_key:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set; cannot initialize LLM judge model."
    )

judge_model = LiteLLMModel(model="groq/llama-3.3-70b-versatile",api_key=groq_key)

@router.post("/judge", response_model=LLMJudgeResponse)
async def judge_output(request: LLMJudgeRequest):
    try:
        metric = GEval(
            name="Hallucination",
            criteria="Given an input text and a predicted next word, determine if the predicted word could plausibly continue the input as part of a longer phrase. Common words like 'the', 'a', 'of', 'in' are almost always valid continuations. For example, 'the' after 'the largest country in' scores 1.0 because it continues as 'the world'. Only score low if the word is clearly factually wrong or grammatically impossible.",
            evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
            model=judge_model, async_mode=False
        )
        test_case = LLMTestCase(
            input=request.input_text,
            actual_output=request.generated_text
        )
        metric.measure(test_case)

        if metric.score > 0.7:
            conclusion = "low"
        elif metric.score > 0.3:
            conclusion = "medium"
        else:
            conclusion = "high"
        
        passed = metric.score >= metric.threshold

        return LLMJudgeResponse(
            score=metric.score,
            conclusion=conclusion,
            reason=metric.reason,
            passed=passed
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Hallucination metrics (LLM-as-a-judge) failed: {str(e)}"
        )

