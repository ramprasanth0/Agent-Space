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

    async def get_response(self, message:str) -> str:
        api_key = os.environ.get("PERPLEXITY_API_KEY")
        endpoint = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "sonar-pro",
            "messages": [
                {"role": "user","content":message}
            ]
        }

        async with httpx.AsyncClient() as client:           # async context manager to handle the api request
            response = await client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()                     # <-- raises an exception if not 2xx/3xx(http code)
            data = response.json()                          # response data
            return data.get("choices", [{}])[0].get("message", {}).get("content", "No response")



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