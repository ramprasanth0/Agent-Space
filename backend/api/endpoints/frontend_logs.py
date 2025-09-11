from fastapi import APIRouter, Request
from ...core.logging import logger

router = APIRouter()

@router.post("/api/frontend-logs")
async def frontend_logs(request: Request):
    try:
        data = await request.json()
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