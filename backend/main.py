from fastapi import FastAPI,HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List,Literal

from backend.agents.perplexity import PerplexityAgent
from backend.agents.gemini import GeminiAgent
from backend.agents.open_router import OpenRouterAgent
from backend.agents.multi_agent_orchestrator import MultiAgentOrchestrator

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


#function to normalize history
def normailize_history(history):
    normalized_dicts = []
    for msg in history:
        if isinstance(msg, dict):
            normalized_dicts.append(msg)
        elif hasattr(msg, "dict") and callable(getattr(msg, "dict")):
            normalized_dicts.append(msg.dict())
        else:
            raise HTTPException(status_code=400, detail=f"Invalid message in history: {msg!r}")
    return normalized_dicts


#Integration of Perplexity LLM
@app.post("/chat/perplexity",response_model=ChatResponse)
async def chat_perplexity(request: ChatRequest):

    #conversation state enabled perplexity agent
    # print(f"request,{request}")
    history_normalized=normailize_history(request.history)
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_normalized
    try:
        result = await perplexity_agent.get_response(message=request.message,history=history_payload)
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

    history_normalized=normailize_history(request.history)
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_normalized
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


####---------------------------- Open router models -----------------------------###
#Integration of deepseek LLM (Open Router)
@app.post("/chat/deepseek",response_model=ChatResponse)
async def chat_deepseek(request: ChatRequest):
    history_normalized=normailize_history(request.history)
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_normalized
    try:
        reply = await openRouterAgent.get_response(message=request.message, model="R1", history=history_payload)
        return ChatResponse(provider="deepseek",response=reply)
    except Exception as e:
        print("Deepseek Agent Error",e)
        return JSONResponse(
            status_code=500,
            content={"provider": "DeepSeek", "response": "Internal error. Please try again later."}
        )


#Integration of qwen LLM (Open Router)
@app.post("/chat/qwen",response_model=ChatResponse)
async def chat_qwen(request: ChatRequest):
    history_normalized=normailize_history(request.history)
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_normalized
    try:
        reply = await openRouterAgent.get_response(message=request.message, model="Qwen", history=history_payload)
        return ChatResponse(provider="qwen",response=reply)
    except Exception as e:
        print("Qwen Agent Error",e)
        return JSONResponse(
            status_code=500,
            content={"provider": "Qwen", "response": "Internal error. Please try again later."}
        )  


## Multi-agent request API

@app.post("/chat/multi_agent",response_model=List[ChatResponse])
async def chat_unified(request: MultiAgentRequest):
    orchestrator = MultiAgentOrchestrator()
    reply= await orchestrator.get_responses(request.message, request.agents)
    return reply
