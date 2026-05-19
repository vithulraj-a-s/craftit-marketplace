from collections import defaultdict
from profiles.models import ArtistProfile
from ai.clients.semantic_search_client import (
    SemanticSearchClient
)

class SemanticSearchService:

    @staticmethod
    def search(query):

        artist_response = (
            SemanticSearchClient.semantic_search(query)
        )

        portfolio_response = (
            SemanticSearchClient.semantic_portfolio_search(query)
        )

        artist_scores = {}

        for result in artist_response["results"]:

            artist_scores[result["artist_id"]] = {
                "artist_score": result["score"],
                "portfolio_score": 0
            }

        for result in portfolio_response["results"]:

            artist_id = result["artist_id"]

            current_best = artist_scores.get(
                artist_id,
                {
                    "artist_score": 0,
                    "portfolio_score": 0
                }
            )

            current_best["portfolio_score"] = max(
                current_best["portfolio_score"],
                result["score"]
            )

            artist_scores[artist_id] = current_best

        final_rankings = []

        for artist_id, scores in artist_scores.items():

            final_score = (
                scores["artist_score"] * 0.8 +
                scores["portfolio_score"] * 0.2
            )
            print({
                "artist_id": artist_id,
                "artist_score": scores["artist_score"],
                "portfolio_score": scores["portfolio_score"],
                "final_score": final_score
            })

            final_rankings.append(
                (
                    artist_id,
                    final_score
                )
            )

        final_rankings.sort(
            key=lambda x: x[1],
            reverse=True
        )

        ranked_artist_ids = [
            artist_id
            for artist_id, _ in final_rankings
        ]

        artists_map = {
            artist.id: artist
            for artist in ArtistProfile.objects.filter(
                id__in=ranked_artist_ids
            )
        }

        ordered_artists = [
            artists_map[artist_id]
            for artist_id in ranked_artist_ids
            if artist_id in artists_map
        ]

        return ordered_artists