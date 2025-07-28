from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agents.perplexity import PerplexityAgent

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

@app.post("/perplexity")
async def chat_perplexity():
    response = await perplexity_agent.get_response("where is france")
    return response
