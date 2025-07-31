from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai import types
from .base import BaseAgentModel
# import 


#loading environment variable
load_dotenv()

class GeminiAgent():
    def __init__(self):
        # Explicitly set up API key from env (loads from env variable automatically)
        # self.model_name = "gemini-2.5-flash"  # or any other valid model
        self.model = genai.GenerativeModel("gemini-2.5-flash")


    def get_response(self, message: str) -> str:
        prompt = prompt = "Answer every prompt as concisely as possible, ideally 1-2 sentences.\n" + message
        try:
            response = self.model.generate_content(contents=prompt)
            return response.text
        except Exception as e:
            print("GeminiAgent error:", repr(e))
            raise


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

    
