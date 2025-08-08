import asyncio

from .base import BaseAgentModel
from backend.agents.perplexity import PerplexityAgent
from backend.agents.gemini import GeminiAgent
from backend.agents.open_router import OpenRouterAgent

AGENT_REGISTRY = {
    "Sonar": PerplexityAgent(),
    "Gemini": GeminiAgent(),
    "R1": OpenRouterAgent(),
    "Qwen": OpenRouterAgent(),
    # add more agents here!
}


class MultiAgentOrchestrator(BaseAgentModel):

    def __init__(self):
        self.registry=AGENT_REGISTRY

    async def get_responses(self,message, models):
        async def call_agent(name: str):
            agent = self.registry.get(name)
            try:
                if name in ("R1", "Qwen"):    # These are OpenRouterAgent; pass the model key
                    res = agent.get_response(message, model=name)  # model param decides backend model string
                else:
                    res = agent.get_response(message)
                    
                if asyncio.iscoroutine(res):
                    response = await res
                else:
                    response = res
                return {"provider": name, "response": response}
            except Exception as e:
                return {"provider": name, "response": f"Error: {str(e)}"}
        results = await asyncio.gather(*(call_agent(name) for name in models))
        return results
    