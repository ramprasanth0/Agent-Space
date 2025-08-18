from fastapi import FastAPI,HTTPException
from fastapi.responses import JSONResponse,StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List,Literal
import asyncio
import json

from .schema import LLMStructuredOutput
from .agents.perplexity import PerplexityAgent
from .agents.gemini import GeminiAgent
from .agents.open_router import OpenRouterAgent
# from agents.multi_agent_orchestrator import MultiAgentOrchestrator

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

@app.post("/stream/perplexity")
async def stream_perplexity(request: ChatRequest):

    history_payload = normalize_history(request.history)
    print(history_payload)
    async def event_generator():
        accumulated_answer = ""
        
        try:
            # Phase 1: Stream raw text
            async for partial in perplexity_agent.stream_response(
                message=request.message,
                history=history_payload
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                # Stream individual tokens
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Phase 2: Get structured response with the accumulated answer
            # Make a single call to get structured data
            structured_response = await perplexity_agent.get_response(
                message=request.message,
                history=history_payload
            )
            
            # Use the streamed answer (might be more complete)
            structured_response.answer = accumulated_answer
            
            # Send the complete structured response
            yield f"data: {json.dumps({'structured': structured_response.model_dump()}, ensure_ascii=False)}\n\n"
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
            # Single API call - stream tokens
            async for partial in openRouterAgent.stream_response(
                message=request.message,
                model="R1",
                history=history_payload
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Create structured response from accumulated text (no API call)
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
            
            # Send final structured object (same format as Perplexity/Gemini)
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
            # Single API call - stream tokens
            async for partial in openRouterAgent.stream_response(
                message=request.message,
                model="Qwen",
                history=history_payload
            ):
                token = partial.get("answer", "")
                accumulated_answer += token
                yield f"data: {json.dumps({'answer': token}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)

            # Create structured response from accumulated text (no API call)
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
            
            # Send final structured object (same format as Perplexity/Gemini)
            yield f"data: {final_structured.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


###############################################
######## non streaming api's ##################
###############################################

#Integration of Perplexity LLM
@app.post("/chat/perplexity",response_model=ChatResponse)
async def chat_perplexity(request: ChatRequest):

    #conversation state enabled perplexity agent
    # print(f"request,{request}")
    history_normalized=normalize_history(request.history)
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_normalized
    try:
        result = await perplexity_agent.get_response(message=request.message,history=history_payload)
        debug = ChatResponse(provider= "perplexity",response= result)
        print(debug)
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

    history_normalized=normalize_history(request.history)
    if request.mode == "one-liner":
        history_payload = [{"role": "user", "content": request.message}]
    else:
        history_payload = history_normalized
    try:
        reply = await run_in_threadpool(gemini_agent.get_response, request.message, history_payload)
        debug = ChatResponse(provider= "gemini",response= reply)
        print(debug)
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
    history_normalized=normalize_history(request.history)
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
    history_normalized=normalize_history(request.history)
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

# @app.post("/chat/multi_agent",response_model=List[ChatResponse])
# async def chat_unified(request: MultiAgentRequest):
#     orchestrator = MultiAgentOrchestrator()
#     reply= await orchestrator.get_responses(request.message, request.agents)
#     return reply

