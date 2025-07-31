from fastapi import FastAPI,HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List

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

#agents initialization
perplexity_agent = PerplexityAgent()
gemini_agent=GeminiAgent()
openRouterAgent=OpenRouterAgent()

class ChatRequest(BaseModel):
    message : str

class ChatResponse(BaseModel):
    provider: str
    response: str

class MultiAgentRequest(BaseModel):
    message: str
    agents: List[str]


#Integration of Perplexity LLM
@app.post("/chat/perplexity",response_model=ChatResponse)
async def chat_perplexity(request: ChatRequest):
    try:
        result = await perplexity_agent.get_response(message=request.message)
        return ChatResponse(provider= "perplexity",response= result)

        #testing
        # result = ChatResponse(provider= "perplexity",response= result)
        # print(result)
        # return result

    except Exception as e:
        print("PerplexityAgent error:", e)
        # Always return JSON error
        return JSONResponse(
            status_code=500,
            content={"provider": "perplexity", "response": "Internal error. Please try again later."}
        )

#Integration of Gemini LLM
@app.post("/chat/gemini",response_model=ChatResponse)
async def chat_gemini(request: ChatRequest):
    # result = gemini_agent.get_response(request.message)
    # return ChatResponse(provider= "gemini", response= result)
    reply = await run_in_threadpool(gemini_agent.get_response, request.message)
    return ChatResponse(provider="gemini", response= reply)


#Integration of deepseek LLM (Open Router)
@app.post("/chat/deepseek",response_model=ChatResponse)
async def chat_deepseek(request: ChatRequest):

    reply = await openRouterAgent.get_response(message=request.message, model="deepseek/deepseek-r1-0528:free")
    return ChatResponse(provider="deepseek",response=reply)


#Integration of qwen LLM (Open Router)
@app.post("/chat/qwen",response_model=ChatResponse)
async def chat_deepseek(request: ChatRequest):

    reply = await openRouterAgent.get_response(message=request.message, model="qwen/qwen3-coder:free")
    return ChatResponse(provider="qwen",response=reply)

@app.post("/chat/multi_agent",response_model=List[ChatResponse])
async def chat_unified(request: MultiAgentRequest):
    orchestrator = MultiAgentOrchestrator()
    reply= await orchestrator.get_responses(request.message, request.agents)
    return reply