from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi import status
from ...models.schema import FeedbackIn
from ...services.ses_service import send_feedback_email

router = APIRouter()

@router.post("/api/feedback")
async def feedback(payload: FeedbackIn, background: BackgroundTasks):
    background.add_task(send_feedback_email, payload.message)
    return JSONResponse({"ok": True}, status_code=status.HTTP_202_ACCEPTED)