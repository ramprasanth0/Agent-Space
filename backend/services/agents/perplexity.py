# agents/perplexity.py
# NOTE: Existing comments are kept; new/changed lines are annotated with (NEW).

import os
import json
import httpx
from typing import AsyncGenerator, Dict, Any, List, Optional
from dotenv import load_dotenv

from .base import BaseAgentModel
from ...models.schema import LLMStructuredOutput,KeyValuePair


#loading environment variable
load_dotenv()

class PerplexityAgent(BaseAgentModel):
    BASE_URL = "https://api.perplexity.ai/chat/completions"

    def __init__(self, model: str = "sonar"):
        self.model = model

    async def get_response(self, message: str ="", history = None):
        # print(history)
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        chat_history = history or [{"role": "user", "content": message}]
        if not api_key:
            raise Exception("PERPLEXITY_API_KEY not set in environment.")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Always convert any Pydantic objects to dicts before sending to the API
        # chat_history = self.format_history(history or [{"role": "user", "content": message}])

        payload = {
            "model": self.model,  # available "sonar-pro" & "sonar"
            "messages": chat_history,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "schema": LLMStructuredOutput.model_json_schema()
                }
            }
        }
        try:
            # (NEW) Use finite timeouts to prevent hanging sockets
            timeout = httpx.Timeout(connect=10.0, read=60.0, write=30.0, pool=60.0)
            async with httpx.AsyncClient(timeout=timeout) as client:  # async context manager to handle the api request
                response = await client.post(self.BASE_URL, headers=headers, json=payload)
                try:
                    response.raise_for_status()
                except Exception:
                    try:
                        error_body = response.json()
                    except Exception:
                        error_body = response.text
                    print("Perplexity API error:", response.status_code, error_body)
                    raise Exception(f"Perplexity API call failed: {error_body}")
                data = response.json()
                try:
                    parsed = LLMStructuredOutput.model_validate_json(data["choices"]["message"]["content"])
                    print(type(parsed))
                except Exception as e:
                    # fallback, or return an error placeholder/dict
                    parsed = LLMStructuredOutput(
                        answer = "Sorry, I couldn't parse the response as expected.",
                        extra = {"error": str(e), "raw": data["choices"]["message"]["content"]}
                    )
                return parsed

        #Exception handling
        except httpx.ReadTimeout:
            raise Exception("Perplexity API timed out. Check network, endpoint, and API key.")
        except Exception as e:
            print("Probably other error", e)
            raise

    ############## streaming function ################
    async def stream_response(self, message: str, history=None) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream raw text response and forward provider metadata (NEW)."""
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        if not api_key:
            raise Exception("PERPLEXITY_API_KEY not set in environment.")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": history or [{"role": "user", "content": message}],
            "stream": True,  # Enable streaming
            # DON'T use structured format for streaming - get raw deltas
        }

        # Long-lived read with finite connect/write timeouts
        timeout = httpx.Timeout(connect=10.0, read=None, write=30.0, pool=60.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", self.BASE_URL, headers=headers, json=payload) as response:
                response.raise_for_status()

                # Iterate over SSE lines and forward tokens + metadata
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue

                    data = line[len("data: "):].strip()
                    if data == "[DONE]":
                        break

                    try:
                        chunk = json.loads(data)
                    except json.JSONDecodeError:
                        continue

                    ## Defensive: choices is a LIST; index before delta
                    choices = chunk.get("choices") or []
                    if isinstance(choices, list) and choices:
                        delta = choices[0].get("delta", {}) or {}
                        token = delta.get("content", "")
                        if token:
                            # Yield just the token for streaming
                            yield {"answer": token}
                            
                    #  Perplexity may include metadata near the end
                    if "search_results" in chunk and chunk["search_results"]:
                        yield {"search_results": chunk["search_results"]}
                    if "usage" in chunk and chunk["usage"]:
                        yield {"usage": chunk["usage"]}
