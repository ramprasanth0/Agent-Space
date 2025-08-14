import pytest
pytest.skip("Skipping this test file", allow_module_level=True)
from backend.agents.gemini import GeminiAgent

class Dummy:
    # Used to mimic a Pydantic-like model with .dict()
    def __init__(self, role, content):
        self.role = role
        self.content = content
    def dict(self):
        return {"role": self.role, "content": self.content}

def test_format_history_with_dict_and_model():
    agent = GeminiAgent()

    # Test with a dict input
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ]

    formatted = agent.format_history(history)
    assert formatted == [
        {"role": "user", "parts": [{"text": "Hello"}]},
        {"role": "model", "parts": [{"text": "Hi there!"}]}
    ]

    # Test with a Dummy Pydantic-like object
    model_history = [
        Dummy("user", "Hello"),
        Dummy("assistant", "Howdy")
    ]
    formatted = agent.format_history(model_history)
    assert formatted == [
        {"role": "user", "parts": [{"text": "Hello"}]},
        {"role": "model", "parts": [{"text": "Howdy"}]}
    ]

def test_format_history_preserves_unknown_role():
    agent = GeminiAgent()
    # If role is neither user nor assistant, keep as-is
    history = [{"role": "system", "content": "Welcome!"}]
    formatted = agent.format_history(history)
    assert formatted == [
        {"role": "system", "parts": [{"text": "Welcome!"}]}
    ]

def test_format_history_empty():
    agent = GeminiAgent()
    assert agent.format_history([]) == []


####################################
# --- Mock test for get_response ---
####################################

from unittest.mock import patch, MagicMock

def test_get_response_roundtrip():
    agent = GeminiAgent()
    # Patch the model's generate_content to avoid real API call
    fake_response = MagicMock()
    fake_response.text = "Fake Gemini output"
    with patch.object(agent.model, "generate_content", return_value=fake_response) as mock_gen:
        history = [
            {"role": "user", "content": "What's Gemini?"},
            {"role": "assistant", "content": "A Google AI model."}
        ]
        result = agent.get_response(message=None, history=history)
        # Did we get the made-up response?
        assert result == "Fake Gemini output"
        # Did we actually call generate_content with the correct shape?
        called_args, called_kwargs = mock_gen.call_args
        contents = called_kwargs.get("contents") or called_args[0]
        assert isinstance(contents, list)
        assert contents[0]["role"] == "user"
        assert contents[-1]["role"] in ["user", "model", "assistant", "system"]  # Defensive

    # optional: check print side effect or error handling here
