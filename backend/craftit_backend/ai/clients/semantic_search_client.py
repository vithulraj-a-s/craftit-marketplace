import logging

import httpx


logger = logging.getLogger(__name__)


class SemanticSearchClient:

    BASE_URL = "http://ai-service:8001"

    @classmethod
    def index_artist(
        cls,
        artist_id,
        search_text
    ):

        try:

            response = httpx.post(
                f"{cls.BASE_URL}/index/artist",
                json={
                    "artist_id": artist_id,
                    "search_text": search_text
                },
                timeout=10
            )

            response.raise_for_status()

        except Exception as e:

            logger.exception(
                f"Semantic indexing failed for artist {artist_id}: {str(e)}"
            )

    @classmethod
    def semantic_search(cls, query):

        try:

            response = httpx.post(
                f"{cls.BASE_URL}/search",
                json={
                    "query": query
                },
                timeout=10
            )

            response.raise_for_status()

            return response.json()

        except Exception as e:

            logger.exception(
                f"Semantic search failed: {str(e)}"
            )

            return {
                "results": []
            }
    
    @classmethod
    def index_portfolio_item(cls,portfolio_item_id,artist_id,search_text):
            
            try:

                response = httpx.post(
                    f"{cls.BASE_URL}/index/portfolio",
                    json={
                        "portfolio_item_id": portfolio_item_id,
                        "artist_id": artist_id,
                        "search_text": search_text
                    },
                    timeout=15
                )

                response.raise_for_status()

            except Exception as e:

                logger.exception(
                    f"Portfolio indexing failed: {str(e)}"
                )

    @classmethod
    def semantic_portfolio_search(
        cls,
        query
    ):

        response = httpx.post(
            f"{cls.BASE_URL}/search/portfolio",
            json={
                "query": query
            },
            timeout=30
        )

        response.raise_for_status()

        return response.json()