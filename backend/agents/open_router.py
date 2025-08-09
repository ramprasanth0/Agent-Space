import os
import requests
import json
import httpx
from dotenv import load_dotenv
from .base import BaseAgentModel
from ..schema import LLMStructuredOutput,KeyValuePair

#loading environment variable
load_dotenv()

class OpenRouterAgent:
    MODEL_NAME_MAP = {
        "R1": "deepseek/deepseek-r1-0528:free",
        "Qwen": "qwen/qwen3-4b:free"
    }

    def _build_json_schema(self):
        """Generate a JSON Schema from the Pydantic model (no extra props allowed)"""
        schema_dict = LLMStructuredOutput.model_json_schema()
        schema_dict["additionalProperties"] = False  # Ensure strict mode
        return {
            "type": "json_schema",
            "json_schema": {
                "name": "llm_structured_output",
                "strict": True,
                "schema": schema_dict
            }
        }

    async def get_response(self, model: str, message: str = None, history=None) -> LLMStructuredOutput:
        model_name = self.MODEL_NAME_MAP.get(model)
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise Exception("OPENROUTER_API_KEY not set in environment.")

        # Build conversation history
        chat_history = history or []
        if message:
            chat_history.append({"role": "user", "content": message})

        endpoint = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model_name,
            "messages": chat_history,
            "response_format": self._build_json_schema()  # Enforce schema
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(endpoint, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

                # The API should return a JSON string in "content"
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")

                try:
                    return LLMStructuredOutput.model_validate_json(content)
                except Exception as parse_exc:
                    return LLMStructuredOutput(
                        answer=content or "",
                        extra=[KeyValuePair(key="parse_error", value=str(parse_exc))]
                    )

        except httpx.ReadTimeout:
            raise Exception("OpenRouter API timed out. Check network, endpoint, and API key.")
        except httpx.HTTPStatusError:
            try:
                error_body = response.json()
            except Exception:
                error_body = response.text
            raise Exception(f"OpenRouter API call failed: {error_body}")
        except Exception as e:
            print("OpenRouterAgent error:", e)
            raise