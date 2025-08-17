import os
import httpx
import json
from dotenv import load_dotenv
from .base import BaseAgentModel
from schema import LLMStructuredOutput

#loading environment variable
load_dotenv()


class PerplexityAgent(BaseAgentModel):

    #function to format history for respective LLM
    # def format_history(self,history):
    #     formatted = []
    #     for msg in history:
    #         if hasattr(msg, "dict"):
    #             formatted.append(msg.dict())
    #         elif isinstance(msg, dict):
    #             formatted.append(msg)
    #         else:
    #             # Defensive: convert Message-like objects (if accidentally received as a string, raise)
    #             raise ValueError(f"Invalid message type in history: {type(msg)} - {msg!r}")
    #     return formatted


    async def get_response(self, message:str = None, history = None):
        # print(history)
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        chat_history = history or [{"role": "user", "content": message}]
        if not api_key:
            raise Exception("PERPLEXITY_API_KEY not set in environment.")
        endpoint = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Always convert any Pydantic objects to dicts before sending to the API
        # chat_history = self.format_history(history or [{"role": "user", "content": message}])

        payload = {
            "model": "sonar",  # available "sonar-pro" & "sonar"
            # "messages": [
            #     {"role": "system", "content": "provide answers in less than 15 words."},
            #     {"role": "user","content":message},
            # ],
            "messages":chat_history,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "schema": LLMStructuredOutput.model_json_schema()
                }
            }
        }
        try:
            # print(api_key)
            async with httpx.AsyncClient(timeout=30) as client:           # async context manager to handle the api request
                # print(f"payload,{payload}")
                response = await client.post(endpoint, headers=headers, json=payload)
                try:
                    response.raise_for_status()
                except Exception:
                    try:
                        error_body = await response.json()
                    except Exception:
                        error_body = await response.text()
                    print("Perplexity API error:", response.status_code, error_body)
                    raise Exception(f"Perplexity API call failed: {error_body}")
                data = response.json()
                try:
                    parsed = LLMStructuredOutput.model_validate_json(data["choices"][0]["message"]["content"])
                    print(type(parsed))
                except Exception as e:
                    # fallback, or return an error placeholder/dict
                    parsed = LLMStructuredOutput(
                        answer = "Sorry, I couldn't parse the response as expected.",
                        extra = {"error": str(e), "raw": data["choices"][0]["message"]["content"]}
                    )
                return parsed

        #Exception handling
        except httpx.ReadTimeout:                   
            raise Exception("Perplexity API timed out. Check network, endpoint, and API key.")
        except Exception as e:
            print("Probably other error",e)
            raise



    ############## streaming function ################
    async def stream_response(self, message: str, history=None):
        """Stream raw text response without structured format"""
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        if not api_key:
            raise Exception("PERPLEXITY_API_KEY not set in environment.")

        endpoint = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "sonar",
            "messages": history or [{"role": "user", "content": message}],
            "stream": True,  # Enable streaming
            # DON'T use structured format for streaming - just get raw text
            # Remove the response_format for streaming
        }

        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", endpoint, headers=headers, json=payload) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue

                    data = line[len("data: "):].strip()
                    if data == "[DONE]":
                        break

                    try:
                        parsed = json.loads(data)
                        delta = parsed["choices"][0].get("delta", {})
                        token = delta.get("content", "")
                        if token:
                            # Yield just the token for streaming
                            yield {"answer": token}
                    except (json.JSONDecodeError, KeyError):
                        continue
