from dotenv import load_dotenv
from google import genai
from google.genai import types
# from .base import BaseAgentModel
from ...models.schema import LLMStructuredOutput,KeyValuePair

import asyncio


#loading environment variable
load_dotenv()

class GeminiAgent():
    def __init__(self):
        # Explicitly set up API key from env (loads from env variable automatically)
        self.client = genai.Client()

    #function to format history for gemini LLM
    def format_history(self, history):
        """Convert chat history to new SDK format"""
        role_map = {"assistant": "model", "user": "user"}
        formatted = []
        
        for msg in history:
            if hasattr(msg, "dict"):
                d = msg.dict()
            else:
                d = msg
                
            formatted.append(
                types.Content(
                    role=role_map.get(d["role"], d["role"]),
                    parts=[types.Part.from_text(text=d["content"])]
                )
            )
        return formatted


    def get_response(self, message:str = "", history = None) -> LLMStructuredOutput:

        # Compose the chat to Gemini - all previous plus new user message at end
        try:
            chat_history = self.format_history((history or []))
            response = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=chat_history,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=LLMStructuredOutput,  # Full schema validation!
                ),
            )
            # The API may already parse JSON and return a dict, or just a string
            content = response.text
            try:
                # Parse structured output
                out = LLMStructuredOutput.model_validate_json(content)
            except Exception as exc:
                # Fallback: include parsing error
                out = LLMStructuredOutput(
                    answer=content or "",
                    extra=[KeyValuePair(key="parse_error", value=repr(exc))]
                )
            return out
            
        except Exception as e:
            print("GeminiAgent error:", repr(e))
            return LLMStructuredOutput(
                answer="", 
                extra={"error": repr(e)}
            )
    

    async def stream_response(self, message: str, history=None):
        try:
            chat_history = self.format_history(history)
            if message:
                chat_history.append(types.Content(role="user",
                                   parts=[types.Part.from_text(text=message)]))
            # Use one consistent model id across methods
            response = self.client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=chat_history,
                config=types.GenerateContentConfig()
            )
            cumulative = ""
            for chunk in response:
                if hasattr(chunk, "text") and chunk.text:
                    text = chunk.text
                    delta = text[len(cumulative):] if text.startswith(cumulative) else text
                    cumulative = text
                    if delta:
                        yield {"answer": delta}  # only the new part
                await asyncio.sleep(0)  # keep loop responsive
        except Exception as e:
            yield {"error": str(e)}
