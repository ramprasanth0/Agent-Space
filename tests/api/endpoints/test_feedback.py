from fastapi.testclient import TestClient
from backend.main import app            # ← adjust if your app is in a different module

client = TestClient(app)


# ── 1. basic happy-path POST ────────────────────────────────────────────────
def test_feedback_returns_202():
    response = client.post(
        "/api/feedback",
        json={"message": "pytest feedback"}
    )

    assert response.status_code == 202
    assert response.json() == {"ok": True}
