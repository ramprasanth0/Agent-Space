from abc import ABC, abstractmethod

class BaseAgentModel:
    """
    Base class for agent models.
    
    """
    @abstractmethod
    async def get_response(self,*args,**kwargs)->str:

        """
        Takes in user input and produces response based on the LLM's
        """
        pass

    @property
    @abstractmethod
    def info(self)->str:
        """
        To get the agents(LLM's) name and other info
        """
        pass
