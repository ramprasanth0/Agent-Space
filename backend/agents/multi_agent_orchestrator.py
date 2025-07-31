import asyncio

from .base import BaseAgentModel
from agents.perplexity import PerplexityAgent
from agents.gemini import GeminiAgent
from agents.open_router import OpenRouterAgent

AGENT_REGISTRY = {
    "perplexity": PerplexityAgent(),
    "gemini": GeminiAgent(),
    "deepseek": OpenRouterAgent(),
    "qwen": OpenRouterAgent(),
    # add more agents here!
}



class MultiAgentOrchestrator(BaseAgentModel):

    def __init__(self):
        self.registry=AGENT_REGISTRY

    async def get_responses(self,message, models):
        async def call_agent(name: str):
            agent = self.registry.get(name)
            try:
                # PerplexityAgent might be async; GeminiAgent might be sync - handle both.
                if(name=="perplexity" or name=="gemini"):
                    res = agent.get_response(message)
                elif(name=="deepseek" or name=="qwen"):
                    res = agent.get_response(message)
                if asyncio.iscoroutine(res):
                    response = await res
                return {"provider": name, "response": response}
            except Exception as e:
                return {"provider": name, "response": f"Error: {str(e)}"}
        results = await asyncio.gather(*(call_agent(name) for name in models))
        return results
    