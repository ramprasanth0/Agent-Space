from fastapi import FastAPI,HTTPException,Request, BackgroundTasks
from fastapi.responses import JSONResponse,StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import status
from pydantic import BaseModel,constr
from pydantic import Field
from typing import List,Literal
import logging
import watchtower
import sys
import asyncio
import json
import os, boto3
from botocore.exceptions import ClientError

from .schema import LLMStructuredOutput,Source,KeyValuePair
from .agents.perplexity import PerplexityAgent
from .agents.gemini import GeminiAgent
from .agents.open_router import OpenRouterAgent

# ------------------------
# Logging Configuration
# ------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("agent-space")

# --- Backend logger setup for CloudWatch ---
logger = logging.getLogger("agent-space")
logger.setLevel(logging.INFO)

# Attach CloudWatch handler
cw_handler = watchtower.CloudWatchLogHandler(log_group="agent-space-logs", stream_name="backend")
logger.addHandler(cw_handler)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#check if server is running
@app.get("/")
async def home():
    return {"message": "Hello, World!"}


#history storage for each session
# history=[]
#agents initialization
perplexity_agent = PerplexityAgent()
gemini_agent=GeminiAgent()
openRouterAgent=OpenRouterAgent()

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

#Single Agent API Request and Response model
class ChatRequest(BaseModel):
    message : str
    history: List[Message] = []
    mode: str = "one-liner"  # or "conversation"
    structured_followup: bool = True  # fill non-token fields at end

class ChatResponse(BaseModel):
    provider: str
    response: LLMStructuredOutput

#Multi Agent API Request and Response model
class MultiAgentRequest(BaseModel):
    message: str
    agents: List[str]

# (NEW) Normalize provider-specific search_results into List[Source]
def normalize_sources(raw) -> list[Source] | None:
    """
    Convert Perplexity search_results into schema Source objects.
    Expects items with 'url' and optional 'title'; ignores malformed entries.
    """
    out: list[Source] = []
    if isinstance(raw, list):
        for item in raw:
            if isinstance(item, dict):
                url = item.get("url") or item.get("source") or ""  # tolerate alt keys
                title = item.get("title")
                if url:
                    out.append(Source(url=url, title=title))
    return out or None

# (NEW) Convert error/usage data into List[KeyValuePair] with string values
def to_extra_kv(error: str | None, usage: dict | None) -> list[KeyValuePair] | None:
    kv: list[KeyValuePair] = []
    if error:
        kv.append(KeyValuePair(key="error", value=error))
    if usage:
        # Convert the usage dictionary into individual key-value pairs.
        for key, value in usage.items():
            kv.append(KeyValuePair(key=key, value=str(value)))
    return kv or None

#function to normalize history
def normalize_history(history):
    normalized_dicts = []
    for msg in history:
        if isinstance(msg, dict):
            normalized_dicts.append(msg)
        elif hasattr(msg, "dict") and callable(getattr(msg, "dict")):
            normalized_dicts.append(msg.dict())
        else:
            raise HTTPException(status_code=400, detail=f"Invalid message in history: {msg!r}")
    return normalized_dicts


####### stream helper functions ##########
async def sse_event(data: str):
    return f"data: {data}\n\n"

def sse(event: str, data: dict | str, seq: int | None = None) -> str:
    """
    Format an SSE frame with optional id and named event, per MDN's text/event-stream framing. (NEW)
    """
    prefix = ""
    if seq is not None:
        prefix += f"id: {seq}\n"
    if event:
        prefix += f"event: {event}\n"
    payload = json.dumps(data, ensure_ascii=False) if isinstance(data, (dict, list)) else str(data)
    return f"{prefix}data: {payload}\n\n"  # MDN SSE framing


########################################
# --- API endpoint for frontend logs ---
########################################

@app.post("/api/frontend-logs")
async def frontend_logs(request: Request):
    """
    Receives logs from the frontend and forwards them to CloudWatch
    """
    try:
        data = await request.json()
        # Expected: {"level": "INFO"|"WARN"|"ERROR", "message": "...", "extra": {...}}
        level = data.get("level", "INFO").upper()
        msg = data.get("message", "")
        extra = data.get("extra", {})

        if level == "ERROR":
            logger.error(msg, extra=extra)
        elif level == "WARN":
            logger.warning(msg, extra=extra)
        else:
            logger.info(msg, extra=extra)

        return {"ok": True}
    except Exception as e:
        logger.exception("Failed to log frontend message")
        return {"ok": False, "error": str(e)}




###############################################
######## streaming api endpoints ##################
###############################################

# Streaming endpoint for Perplexity
@app.post("/stream/perplexity")
async def stream_perplexity(request: Request, payload: ChatRequest):
    # ... (keep normalize_history function and its call) ...
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



# Gemini endpoint
@app.post("/stream/gemini")
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
                    yield sse("error", {"message": partial["error"]}, seq); seq += 1
                    return
                if "answer" in partial:
                    yield sse("token", {"answer": partial["answer"]}, seq); seq += 1
                await asyncio.sleep(0)  # keep loop responsive
            # Final payload with empty answer; add metadata if your agent later provides any
            if not await request.is_disconnected():
                final_structured = LLMStructuredOutput(
                    answer="", explanation=None, sources=None, facts=None,
                    code=None, language=None, actions=None, nerd_stats=None
                )
                yield sse("final", final_structured.model_dump(), seq); seq += 1
            if not await request.is_disconnected():
                yield sse("done", "[DONE]", seq); seq += 1
        except Exception as e:
            yield sse("error", {"message": str(e)}, seq)
    return StreamingResponse(event_generator(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache","X-Accel-Buffering":"no","Connection":"keep-alive"})


# DeepSeek endpoint (Updated)
@app.post("/stream/deepseek")
async def stream_deepseek(request: Request, payload: ChatRequest):  # ✅ Fixed parameter
    history_payload = normalize_history(payload.history)

    async def event_generator():
        seq = 0
        
        try:
            async for partial in openRouterAgent.stream_response(
                message=payload.message,
                model="R1",
                history=history_payload
            ):
                if await request.is_disconnected():  # ✅ Add disconnect check
                    break
                    
                if "error" in partial:
                    yield sse("error", {"message": partial["error"]}, seq)
                    return
                
                if "answer" in partial:
                    token = partial["answer"]
                    seq += 1
                    yield sse("token", {"answer": token}, seq)
                
                await asyncio.sleep(0)

            # Send final response with empty answer + metadata
            if not await request.is_disconnected():
                final_structured = LLMStructuredOutput(
                    answer="",  # Empty
                    explanation="Generated by DeepSeek R1 - a reasoning model focused on step-by-step problem solving",
                    sources=None,
                    facts=None,
                    code=None,
                    language=None,
                    actions=None,
                    nerd_stats=None,
                )
                seq += 1
                yield sse("final", final_structured.model_dump(), seq)
                
            if not await request.is_disconnected():
                seq += 1
                yield sse("done", "[DONE]", seq)

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

# Qwen endpoint
@app.post("/stream/qwen")
async def stream_qwen(request: Request, payload: ChatRequest):  # ✅ Fixed parameter
    history_payload = normalize_history(payload.history)

    async def event_generator():
        seq = 0
        
        try:
            async for partial in openRouterAgent.stream_response(
                message=payload.message,
                model="Qwen",
                history=history_payload
            ):
                if await request.is_disconnected():  # ✅ Add disconnect check
                    break
                    
                if "error" in partial:
                    yield sse("error", {"message": partial["error"]}, seq)
                    return
                
                if "answer" in partial:
                    token = partial["answer"]
                    seq += 1
                    yield sse("token", {"answer": token}, seq)
                
                await asyncio.sleep(0)

            # Send final response with empty answer + metadata
            if not await request.is_disconnected():
                final_structured = LLMStructuredOutput(
                    answer="",  # Empty
                    explanation="Generated by Qwen - a coder model focused on step-by-step coding solution",
                    sources=None,
                    facts=None,
                    code=None,
                    language=None,
                    actions=None,
                    nerd_stats=None,
                )
                seq += 1
                yield sse("final", final_structured.model_dump(), seq)
                
            if not await request.is_disconnected():
                seq += 1
                yield sse("done", "[DONE]", seq)

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



############################
############################
##### Mail Service #########
############################
############################

# --- env-driven config ---
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-2")  # choose your SES region
SES_SENDER = os.environ.get("SES_SENDER")                # verified SES sender (email or domain)
SES_RECIPIENT = os.environ.get("SES_RECIPIENT", "essrramprasanth@gmail.com")  # fixed inbox

# --- boto3 SES client ---
ses = boto3.client("ses", region_name=AWS_REGION)

class FeedbackIn(BaseModel):
    message: str = Field(min_length=1, max_length=5000)

# --- mail sender ---
def send_feedback_email(body: str):
    if not SES_SENDER or not SES_RECIPIENT:
        raise RuntimeError("SES_SENDER or SES_RECIPIENT missing")

    send_args = {
        "Source": SES_SENDER,  # must be a verified identity in SES
        "Destination": {"ToAddresses": [SES_RECIPIENT]},
        "Message": {
            "Subject": {"Data": "New feedback", "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": body, "Charset": "UTF-8"},
                "Html": {"Data": f"<pre>{body}</pre>", "Charset": "UTF-8"},
            },
        },
    }

    try:
        ses.send_email(**send_args)
    except ClientError as e:
        # Log and re-raise so it appears in server logs
        raise

# --- endpoint ---
@app.post("/api/feedback")
async def feedback(payload: FeedbackIn, background: BackgroundTasks):
    background.add_task(send_feedback_email, payload.message)
    return JSONResponse({"ok": True}, status_code=status.HTTP_202_ACCEPTED)


