from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai import types
from .base import BaseAgentModel


#loading environment variable
load_dotenv()

class GeminiAgent():
    def __init__(self):
        # Explicitly set up API key from env (loads from env variable automatically)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    #function to format history for respective LLM
    def format_history(self,history):
        role_map = {"assistant": "model", "user": "user"}
        formatted = []
        for msg in history:
            if hasattr(msg, "dict"):
                d = msg.dict()
            else:
                d = msg
            formatted.append({
                "role": role_map.get(d["role"], d["role"]),
                "parts": [{"text": d["content"]}]
            })
        return formatted


    def get_response(self, message:str = None, history = None) -> str:

        # Compose the chat to Gemini - all previous plus new user message at end
        try:
            chat_history = self.format_history((history or []) + [{"role": "user", "content": message}])
            response = self.model.generate_content(contents=chat_history)
            print(response.text)
            return response.text
        except Exception as e:
            print("GeminiAgent error:", repr(e))
            raise



    #sample template
    # def get_response(self, message: str) -> str:
    # # SDK loads the key from GOOGLE_API_KEY
    #     client = genai.Client()
    #     response = client.models.generate_content(
    #         model=self.model_name,
    #         contents=[{"role": "user", "parts": [{"text": message}]}]
    #     )
    #     # SDK returns a dict-like object; extract text properly
    #     return response.candidates[0].content.parts[0].text

    # def get_response(self,message:str):
    #     # The client gets the API key from the environment variable `GEMINI_API_KEY`.
    #     client = genai.Client()

    #     response = client.models.generate_content(
    #         model="gemini-2.5-flash", contents=message
    #     )

    #     # data = response.json()
    #     return response["candidates"][0]["content"]["parts"][0]["text"]

    
