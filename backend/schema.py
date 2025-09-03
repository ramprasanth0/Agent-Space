from pydantic import BaseModel
from typing import List, Optional

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
