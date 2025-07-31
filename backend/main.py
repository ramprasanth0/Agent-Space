from fastapi import FastAPI,HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from agents.perplexity import PerplexityAgent
from agents.gemini import GeminiAgent


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

class ChatRequest(BaseModel):
    message : str

class ChatResponse(BaseModel):
    provider: str
    response: str

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
    return ChatResponse(provider="gemini", response=  reply)
