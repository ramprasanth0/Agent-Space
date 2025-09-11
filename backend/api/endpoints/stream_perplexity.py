from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from ...models.schema import LLMStructuredOutput, ChatRequest
from ...services.agents.perplexity import PerplexityAgent
from ...core import normalize_history, normalize_sources, to_extra_kv, sse
import asyncio

router = APIRouter()
perplexity_agent = PerplexityAgent()


# Streaming endpoint for Perplexity
@router.post("/stream/perplexity")
async def stream_perplexity(request: Request, payload: ChatRequest):
    history_payload = normalize_history(payload.history)

    async def event_generator():
        accumulated_answer = []
        latest_sources = None
        latest_usage = None
        seq = 0

        upstream = None
        try:
            upstream = perplexity_agent.stream_response(
                message=payload.message,
                history=history_payload
            )

            async for partial in upstream:
                if await request.is_disconnected():
                    break

                # Stream individual tokens
                token = partial.get("answer", "")
                if token:
                    accumulated_answer.append(token)
                    seq += 1
                    yield sse("token", {"answer": token}, seq)
                    await asyncio.sleep(0)

                # Stream sources if available
                if "search_results" in partial:
                    latest_sources = partial.get("search_results")
                    seq += 1
                    yield sse("sources", {"sources": latest_sources}, seq)
                    await asyncio.sleep(0)

                # Stream usage data when it arrives.
                if "usage" in partial:
                    latest_usage = partial["usage"]
                    yield sse("usage", latest_usage, seq)
                    seq += 1

        except (asyncio.CancelledError, ConnectionResetError, BrokenPipeError):
            return
        finally:
            if upstream and hasattr(upstream, "aclose"):
                try:
                    await upstream.aclose()
                except Exception:
                    pass

        # After streaming, build the final object without usage/extra fields.
        if not await request.is_disconnected():
            try:
                final_structured = LLMStructuredOutput(
                    answer="",
                    explanation=None,
                    sources=normalize_sources(latest_sources),
                    facts=None,
                    code=None,
                    language=None,
                    actions=None,
                    nerd_stats=to_extra_kv(None, latest_usage)
                )
                seq += 1
                yield sse("final", final_structured.model_dump(), seq)
            except Exception as ve:
                seq += 1
                yield sse("error", {"message": "finalization failed", "detail": str(ve)}, seq)

        if not await request.is_disconnected():
            seq += 1
            yield sse("done", "[DONE]", seq)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )