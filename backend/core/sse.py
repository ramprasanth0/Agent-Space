import json
from typing import Union, Optional

async def sse_event(data: str) -> str:
    return f"data: {data}\n\n"

def sse(event: str, data: Union[dict, str], seq: Optional[int] = None) -> str:
    """Format Server-Sent Event"""
    if isinstance(data, dict):
        data = json.dumps(data)
    if seq is not None:
        return f"id: {seq}\nevent: {event}\ndata: {data}\n\n"
    return f"event: {event}\ndata: {data}\n\n"