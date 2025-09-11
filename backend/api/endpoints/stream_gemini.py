from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from ...models.schema import LLMStructuredOutput, ChatRequest
from ...services.agents.gemini import GeminiAgent
from ...core import normalize_history, sse
import asyncio

router = APIRouter()

gemini_agent = GeminiAgent()

@router.post("/stream/gemini")
async def stream_gemini(request: Request, payload: ChatRequest):
    history_payload = normalize_history(payload.history)
    
    async def event_generator():
        seq = 0
        try:
            async for partial in gemini_agent.stream_response(
                message=payload.message,
                history=history_payload
            ):
                if await request.is_disconnected():
                    break
                if "error" in partial:
                    yield sse("error", {"message": partial["error"]}, seq)
                    seq += 1
                    return
                if "answer" in partial:
                    yield sse("token", {"answer": partial["answer"]}, seq)
                    seq += 1
                await asyncio.sleep(0)

            if not await request.is_disconnected():
                final_structured = LLMStructuredOutput(
                    answer="", explanation=None, sources=None, facts=None,
                    code=None, language=None, actions=None, nerd_stats=None
                )
                yield sse("final", final_structured.model_dump(), seq)
                seq += 1

            if not await request.is_disconnected():
                yield sse("done", "[DONE]", seq)
                seq += 1

        except Exception as e:
            yield sse("error", {"message": str(e)}, seq)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )