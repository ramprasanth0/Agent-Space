import pytest
from pydantic import ValidationError
from backend.models.schema import (   # ← your file
    Source, Action, KeyValuePair,
    LLMStructuredOutput, Message,
    ChatRequest, FeedbackIn,
)


# ── 1. Source ---------------------------------------------------------------
def test_source_defaults_and_values():
    src = Source(url="http://x.com", title="X")
    assert src.url == "http://x.com"
    assert src.title == "X"

    # title is optional
    assert Source(url="http://y.com").title is None


# ── 2. Action ---------------------------------------------------------------
def test_action_optional_fields():
    act = Action(tool="search")
    assert act.parameters is None
    assert act.result is None


# ── 3. KeyValuePair ---------------------------------------------------------
def test_keyvaluepair_basics():
    kv = KeyValuePair(key="tokens", value="42")
    assert kv.key == "tokens"
    assert kv.value == "42"


# ── 4. LLMStructuredOutput --------------------------------------------------
def test_llm_structured_output_all_fields():
    out = LLMStructuredOutput(
        answer="hi",
        code="print('hi')",
        language="python",
        sources=[Source(url="http://a.com")],
        facts=["fact1"],
        actions=[Action(tool="run")],
        nerd_stats=[KeyValuePair(key="latency", value="123ms")],
    )
    assert out.answer == "hi"
    assert out.sources[0].url == "http://a.com"
    assert out.actions[0].tool == "run"
    assert out.nerd_stats[0].key == "latency"


# ── 5. Message --------------------------------------------------------------
def test_message_role_validation():
    assert Message(role="user", content="hello").role == "user"
    with pytest.raises(ValidationError):
        Message(role="system", content="bad")   # invalid Literal


# ── 6. ChatRequest ----------------------------------------------------------
def test_chat_request_defaults():
    req = ChatRequest(message="Hi")
    assert req.history == []
    assert req.mode == "one-liner"
    assert req.structured_followup is True


# ── 7. FeedbackIn -----------------------------------------------------------
def test_feedback_length_constraints():
    FeedbackIn(message="Nice work!")  # valid

    with pytest.raises(ValidationError):
        FeedbackIn(message="")        # too short

    with pytest.raises(ValidationError):
        FeedbackIn(message="x" * 6000)  # exceeds 5,000 chars
