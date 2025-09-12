import pytest
from backend.core.utils import normalize_sources, to_extra_kv, normalize_history
from backend.models.schema import Source, KeyValuePair, Message

def test_normalize_sources():
    """Test source normalization"""
    raw_sources = [
        {"url": "http://test.com", "title": "Test"},
        {"url": "http://example.com"}
    ]
    sources = normalize_sources(raw_sources)
    assert len(sources) == 2
    assert isinstance(sources[0], Source)
    assert sources[0].url == "http://test.com"
    assert sources[0].title == "Test"

def test_to_extra_kv():
    """Test key-value pair conversion"""
    error = "Test error"
    usage = {"tokens": "100"}
    kv_pairs = to_extra_kv(error, usage)
    assert len(kv_pairs) == 2
    assert isinstance(kv_pairs[0], KeyValuePair)
    assert kv_pairs[0].key == "error"
    assert kv_pairs[0].value == "Test error"

def test_normalize_history():
    """Test chat history normalization"""
    history = [
        Message(role="user", content="test question"),
        {"role": "assistant", "content": "test answer"}
    ]
    normalized = normalize_history(history)
    assert len(normalized) == 2
    assert all(isinstance(msg, dict) for msg in normalized)
    assert all("role" in msg and "content" in msg for msg in normalized)