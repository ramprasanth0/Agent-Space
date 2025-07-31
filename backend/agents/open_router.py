import os
import requests
import json
import httpx
from dotenv import load_dotenv
from .base import BaseAgentModel


#loading environment variable
load_dotenv()


class OpenRouterAgent(BaseAgentModel):
    MODEL_NAME_MAP = {
        "R1": "deepseek/deepseek-r1-0528:free",
        "Qwen": "qwen/qwen3-coder:free"
    }


    async def get_response(self,message,model):
        model_name = self.MODEL_NAME_MAP.get(model)  # default/fallback
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise Exception("PERPLEXITY_API_KEY not set in environment.")
        endpoint = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model_name,  
            "messages": [
                {"role": "system", "content": "provide answers in less than 15 words."},
                {"role": "user","content":message},
            ],
            # 'search_filter': 'very short answers'
        }
        try:
            # print(api_key)
            async with httpx.AsyncClient(timeout=30) as client:           # async context manager to handle the api request
                response = await client.post(endpoint, headers=headers, json=payload)
                try:
                    response.raise_for_status()
                except httpx.HTTPStatusError:
                    # print("Perplexity API error:", response.status_code, await response.text())
                    # raise
                    try:
                        error_body = await response.json()
                    except Exception:
                        error_body = response.text
                    print("Open Router API error:", response.status_code, error_body)
                    raise Exception(f"Open Router API call failed: {error_body}")
                data = response.json()
                # print("FULL Perplexity API raw response:", type(data))
                return data.get("choices", [{}])[0].get("message", {}).get("content", "No response")

        #Exception handling
        except httpx.ReadTimeout:                   
            raise Exception("Open Router API timed out. Check network, endpoint, and API key.")
        except Exception as e:
            print("Probably other error",e)
            raise

