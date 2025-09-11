from pydantic import BaseModel, Field
from typing import List, Optional, Literal

# Existing models (keep as-is)
class Source(BaseModel):
    url: str
    title: Optional[str] = None

class Action(BaseModel):
    tool: str
    parameters: Optional[List[str]] = None
    result: Optional[str] = None

class KeyValuePair(BaseModel):
    key: str
    value: str

class LLMStructuredOutput(BaseModel):
    answer: str
    code: Optional[str] = None
    language: Optional[str] = None
    explanation: Optional[str] = None
    sources: Optional[List[Source]] = None
    facts: Optional[List[str]] = None
    actions: Optional[List[Action]] = None
    nerd_stats: Optional[List[KeyValuePair]] = None

# Add your new request models here
class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message")
    history: List[Message] = Field(default=[], description="Chat history")
    mode: str = Field(default="one-liner", description="Chat mode: one-liner or conversation")
    structured_followup: bool = Field(default=True, description="Include structured metadata in response")

# Add FeedbackIn model
class FeedbackIn(BaseModel):
    message: str = Field(
        ...,  # ... means required
        min_length=1,
        max_length=5000,
        description="Feedback message content"
    )
