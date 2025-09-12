import json
import pytest

from backend.core.sse import sse_event, sse


# ── 1. sse_event helper ───────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_sse_event_returns_correct_format():
    assert await sse_event("hello") == "data: hello\n\n"


# ── 2. sse() with string payload ──────────────────────────────────────────────
def test_sse_with_string_payload():
    out = sse("msg", "hi")
    assert out == "event: msg\ndata: hi\n\n"


# ── 3. sse() with dict payload ────────────────────────────────────────────────
def test_sse_with_dict_payload():
    data = {"a": 1}
    out = sse("msg", data)
    assert out == f"event: msg\ndata: {json.dumps(data)}\n\n"


# ── 4. sse() with explicit sequence id ────────────────────────────────────────
def test_sse_with_sequence_id():
    out = sse("msg", "hi", seq=7)
    assert out == "id: 7\nevent: msg\ndata: hi\n\n"
