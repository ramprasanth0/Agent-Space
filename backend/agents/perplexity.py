import os
import httpx
from dotenv import load_dotenv
from .base import BaseAgentModel

#loading environment variable
load_dotenv()


class PerplexityAgent(BaseAgentModel):

    # def __init__(self):
    #     """
    #     initializing agent specific variables
    #     """
    #     self.api_key = os.environ.get("PERPLEXITY_API_KEY")
    #     self.endpoint = "https://api.perplexity.ai/chat/completions"

    @property
    def info(self):
        return "perplexity"

    async def get_response(self, message:str):
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        if not api_key:
            raise Exception("PERPLEXITY_API_KEY not set in environment.")
        endpoint = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "sonar",  # Change from "sonar-pro" to "sonar"
            "messages": [
                {"role": "system", "content": "provide answers in 15 words."},
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
                except Exception:
                    # print("Perplexity API error:", response.status_code, await response.text())
                    # raise
                    try:
                        error_body = await response.json()
                    except Exception:
                        error_body = await response.text()
                    print("Perplexity API error:", response.status_code, error_body)
                    raise Exception(f"Perplexity API call failed: {error_body}")
                data = response.json()
                # print("FULL Perplexity API raw response:", type(data))
                return data.get("choices", [{}])[0].get("message", {}).get("content", "No response")

        #Exception handling
        except httpx.ReadTimeout:                   
            raise Exception("Perplexity API timed out. Check network, endpoint, and API key.")
        except Exception as e:
            print("Probably other error",e)
            raise




        # response = self.client_instance.chat.completions.create(
        #     model="sonar-pro",
        #     messages=[
        #         {"role": "user", "content": "Latest climate research findings"}
        #     ],
        #     max_tokens=100,
        #     # search_domain_filter=["nature.com", "science.org"],
        #     # search_recency_filter="month",
        #     # return_citations=True,
        #     # return_images=False
        # )
        # return response.choices[0].message.content