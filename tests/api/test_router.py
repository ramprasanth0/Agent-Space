from fastapi.routing import APIRoute
from backend.api.router import api_router


# ── 1. router composition sanity check ───────────────────────────────────────
def test_all_subrouters_are_mounted():
    """
    Make sure the central `api_router` includes every endpoint module we
    registered: Perplexity, Gemini, DeepSeek, Qwen, feedback, frontend-logs.
    """
    paths = {route.path for route in api_router.routes if isinstance(route, APIRoute)}

    expected = {
        "/stream/perplexity",
        "/stream/gemini",
        "/stream/deepseek",
        "/stream/qwen",
        "/api/feedback",
        "/api/frontend-logs",
    }

    # each expected path should be present
    assert expected.issubset(paths)
