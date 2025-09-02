from fastapi import FastAPI,HTTPException,APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse,StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from fastapi import status
from pydantic import BaseModel,constr
from pydantic import Field
from typing import List,Literal
import asyncio
import json
import os, boto3
from botocore.exceptions import ClientError

from .schema import LLMStructuredOutput
from .agents.perplexity import PerplexityAgent
from .agents.gemini import GeminiAgent
from .agents.open_router import OpenRouterAgent

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

class ChatResponse(BaseModel):
    provider: str
    response: LLMStructuredOutput

#Multi Agent API Request and Response model
class MultiAgentRequest(BaseModel):
    message: str
    agents: List[str]


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


###############################################
######## streaming api endpoints ##################
###############################################

# Streaming endpoint for Perplexity
@app.post("/stream/perplexity")
async def stream_perplexity(request: ChatRequest):

    history_payload = normalize_history(request.history)
    print(history_payload)
    async def event_generator():
        accumulated_answer = ""
        
        try:
            # Stream raw text
            async for partial in perplexity_agent.stream_response(
                message=request.message,
                history=history_payload
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                # Stream individual tokens
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Create structured response from accumulated text
            final_structured = LLMStructuredOutput(
                answer=accumulated_answer,
                explanation=None,
                sources=None,
                facts=None,
                code=None,
                language=None,
                actions=None,
                extra=None,
            )
            
            # Send final structured object
            yield f"data: {final_structured.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# Streaming endpoint for Gemini
@app.post("/stream/gemini")
async def stream_gemini(request: ChatRequest):
    
    history_payload = normalize_history(request.history)

    async def event_generator():
        accumulated_answer = ""
        
        try:
            async for partial in gemini_agent.stream_response(
                message=request.message,  # Agent will add this to history
                history=history_payload   # Just the conversation history
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Create final structured response from accumulated text
            final_structured = LLMStructuredOutput(
                answer=accumulated_answer,
                explanation=None,
                sources=None,
                facts=None,
                code=None,
                language=None,
                actions=None,
                extra=None
            )
            
            yield f"data: {final_structured.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/stream/deepseek")
async def stream_deepseek(request: ChatRequest):
    history_payload = normalize_history(request.history)

    async def event_generator():
        accumulated_answer = ""
        
        try:
            # API call - stream tokens
            async for partial in openRouterAgent.stream_response(
                message=request.message,
                model="R1",
                history=history_payload
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Create structured response from accumulated text
            final_structured = LLMStructuredOutput(
                answer=accumulated_answer,
                explanation="Generated by DeepSeek R1 - a reasoning model focused on step-by-step problem solving",
                sources=None,  # R1 doesn't provide sources
                facts=None,
                code=None,
                language=None,
                actions=None,
                extra=None,
            )
            
            # Send final structured object
            yield f"data: {final_structured.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.post("/stream/qwen")
async def stream_qwen(request: ChatRequest):
    
    history_payload = normalize_history(request.history)

    async def event_generator():
        accumulated_answer = ""
        
        try:
            # API call - stream tokens
            async for partial in openRouterAgent.stream_response(
                message=request.message,
                model="Qwen",
                history=history_payload
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Create structured response from accumulated text
            final_structured = LLMStructuredOutput(
                answer=accumulated_answer,
                explanation="Generated by Qwen - a coder model focused on step-by-step coding solution",
                sources=None,  # Qwen doesn't provide sources
                facts=None,
                code=None,
                language=None,
                actions=None,
                extra=None,
            )
            
            # Send final structured object
            yield f"data: {final_structured.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")



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