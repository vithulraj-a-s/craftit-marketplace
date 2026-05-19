import os

from google import genai
from dotenv import load_dotenv


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def rewrite_query(query: str):

    query = query.strip()

    if len(query.split()) >= 4:
        return query

    prompt = f"""
        Rewrite this search query for semantic search retrieval
        of portrait artists and artwork.

        Rules:
        - Keep under 12 words
        - Focus on artistic styles, mediums, and visual concepts
        - Do not explain
        - Do not write sentences
        - Do not use punctuation
        - Return ONLY the rewritten query

        Query:
        {query}
        """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    rewritten = response.text.strip()

    return rewritten