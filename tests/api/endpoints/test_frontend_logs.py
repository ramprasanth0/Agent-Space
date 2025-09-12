import logging
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
LOGGER_NAME = "agent-space"


# ── 1. INFO log captured ────────────────────────────────────────────────────
def test_frontend_logs_info(caplog):
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    resp = client.post(
        "/api/frontend-logs",
        json={"level": "INFO", "message": "hello-info"}
    )

    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    assert "hello-info" in caplog.text


# ── 2. ERROR log captured ───────────────────────────────────────────────────
def test_frontend_logs_error(caplog):
    caplog.set_level(logging.ERROR, logger=LOGGER_NAME)

    resp = client.post(
        "/api/frontend-logs",
        json={"level": "ERROR", "message": "boom!"}
    )

    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    assert "boom!" in caplog.text


# ── 3. bad JSON payload handled gracefully ─────────────────────────────────
def test_frontend_logs_bad_json():
    resp = client.post("/api/frontend-logs", data="not-json")

    # endpoint never raises; it returns ok:False + error string
    assert resp.status_code == 200
    body = resp.json()
    assert body["ok"] is False
    assert "error" in body
