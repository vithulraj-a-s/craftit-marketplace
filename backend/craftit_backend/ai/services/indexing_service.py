from ai.builders.artist_search_document import ArtistSearchDocumentBuilder
from ai.clients.semantic_search_client import SemanticSearchClient


class SemanticIndexingService:

    @staticmethod
    def index_artist(artist):

        search_text = ArtistSearchDocumentBuilder.build(artist)

        SemanticSearchClient.index_artist(
            artist_id=artist.id,
            search_text=search_text
        )