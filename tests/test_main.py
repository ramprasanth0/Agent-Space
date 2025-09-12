import logging, asyncio
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
LOGGER_NAME = "agent-space"


# ── 1. GET / -----------------------------------------------------------------
def test_home_ok():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {
        "status": "ok",
        "message": "Agent Space API is running"
    }


# ── 2. real CORS pre-flight ---------------------------------------------------
def test_cors_headers_present():
    origin = "http://example.org"           # any origin you like

    resp = client.options(
        "/",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )

    # CORSMiddleware handled the OPTIONS request
    assert resp.status_code in (200, 204)
    # It should echo the origin back
    assert resp.headers["access-control-allow-origin"] == origin



# ── 3. startup event logs -----------------------------------------------------
def test_startup_logs(caplog):
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)
    asyncio.get_event_loop().run_until_complete(app.router.startup())
    assert "Application startup: Logging configured" in caplog.text
