from fastapi import FastAPI,HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List,Literal

from agents.perplexity import PerplexityAgent
from agents.gemini import GeminiAgent
from agents.open_router import OpenRouterAgent
from agents.multi_agent_orchestrator import MultiAgentOrchestrator


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def home():
    return {"message": "Hello, World!"}


#history storage for each session
history=[]
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
    response: str

#Multi Agent API Request and Response model
class MultiAgentRequest(BaseModel):
    message: str
    agents: List[str]


#Integration of Perplexity LLM
@app.post("/chat/perplexity",response_model=ChatResponse)
async def chat_perplexity(request: ChatRequest):

    #conversation state enabled perplexity agent
    history_dicts = []
    for msg in request.history:
        if isinstance(msg, dict):
            history_dicts.append(msg)
        elif hasattr(msg, "dict"):
            history_dicts.append(msg.dict())
        else:
            raise HTTPException(status_code=400, detail=f"Invalid message in history: {msg!r}")
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_dicts + [{"role": "user", "content": request.message}]
    try:
        result = await perplexity_agent.get_response(message=request.message,history=history_dicts + [{"role": "user", "content": request.message}])
        return ChatResponse(provider= "perplexity",response= result)
    except Exception as e:
        print("Perplexity Agent error:", e)
        # Always return JSON error
        return JSONResponse(
            status_code=500,
            content={"provider": "perplexity", "response": "Internal error. Please try again later."}
        )

#Integration of Gemini LLM
@app.post("/chat/gemini",response_model=ChatResponse)
async def chat_gemini(request: ChatRequest):
    history_dicts = []
    for msg in request.history:
        if isinstance(msg, dict):
            history_dicts.append(msg)
        elif hasattr(msg, "dict"):
            history_dicts.append(msg.dict())
        else:
            raise HTTPException(status_code=400, detail=f"Invalid message in history: {msg!r}")
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_dicts + [{"role": "user", "content": request.message}]
    try:
        reply = await run_in_threadpool(gemini_agent.get_response, request.message, history_payload)
        return ChatResponse(provider="gemini", response= reply)
    except Exception as e:
        print("Gemini Agent error:", e)
        # Always return JSON error
        return JSONResponse(
            status_code=500,
            content={"provider": "gemini", "response": "Internal error. Please try again later."}
        )


#Integration of deepseek LLM (Open Router)
@app.post("/chat/deepseek",response_model=ChatResponse)
async def chat_deepseek(request: ChatRequest):
    reply = await openRouterAgent.get_response(message=request.message, model="R1")
    return ChatResponse(provider="deepseek",response=reply)


#Integration of qwen LLM (Open Router)
@app.post("/chat/qwen",response_model=ChatResponse)
async def chat_deepseek(request: ChatRequest):
    reply = await openRouterAgent.get_response(message=request.message, model="Qwen")
    return ChatResponse(provider="qwen",response=reply)

@app.post("/chat/multi_agent",response_model=List[ChatResponse])
async def chat_unified(request: MultiAgentRequest):
    orchestrator = MultiAgentOrchestrator()
    reply= await orchestrator.get_responses(request.message, request.agents)
    return reply
