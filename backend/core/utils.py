from typing import List, Optional, Dict, Any
from ..models.schema import Source, KeyValuePair

def normalize_sources(raw: List[Dict[str, Any]]) -> Optional[List[Source]]:
    if not raw:
        return None
    sources = []
    for r in raw:
        try:
            sources.append(Source.model_validate(r))
        except Exception:
            continue
    return sources if sources else None

def to_extra_kv(error: Optional[str], usage: Optional[dict]) -> Optional[List[KeyValuePair]]:
    extras = []
    if error:
        extras.append(KeyValuePair(key="error", value=str(error)))
    if usage:
        for k, v in usage.items():
            extras.append(KeyValuePair(key=k, value=str(v)))
    return extras if extras else None

def normalize_history(history: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not history:
        return []
    normalized = []
    for msg in history:
        if hasattr(msg, "dict"):
            normalized.append(msg.dict())
        else:
            normalized.append(msg)
    return normalized