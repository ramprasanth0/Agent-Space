from fastapi import APIRouter
from .endpoints.stream_perplexity import router as perplexity_router
from .endpoints.stream_gemini import router as gemini_router
from .endpoints.stream_deepseek import router as deepseek_router
from .endpoints.stream_qwen import router as qwen_router
from .endpoints.feedback import router as feedback_router
from .endpoints.frontend_logs import router as frontend_logs_router

api_router = APIRouter()

api_router.include_router(perplexity_router)
api_router.include_router(gemini_router)
api_router.include_router(deepseek_router)
api_router.include_router(qwen_router)
api_router.include_router(feedback_router)
api_router.include_router(frontend_logs_router)