from fastapi import FastAPI,HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from agents.perplexity import PerplexityAgent
from pydantic import BaseModel

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


perplexity_agent = PerplexityAgent()

class ChatRequest(BaseModel):
    message : str

class ChatResponse(BaseModel):
    provider: str
    response: str


@app.post("/chat/perplexity",response_model=ChatResponse)
async def chat_perplexity(request: ChatRequest):
    try:
        result = await perplexity_agent.get_response(message=request.message)
        return ChatResponse(provider= "perplexity",response= result)
    except Exception as e:
        print("PerplexityAgent error:", e)
        # Always return JSON error
        return JSONResponse(
            status_code=500,
            content={"provider": "perplexity", "response": "Internal error. Please try again later."}
        )