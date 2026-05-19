from ai.builders.portfolio_search_document import (
    PortfolioSearchDocumentBuilder
)

from ai.clients.semantic_search_client import (
    SemanticSearchClient
)


class PortfolioSemanticIndexingService:

    @staticmethod
    def index_portfolio_item(portfolio_item):

        search_text = (
            PortfolioSearchDocumentBuilder.build(
                portfolio_item
            )
        )

        SemanticSearchClient.index_portfolio_item(
            portfolio_item_id=portfolio_item.id,
            artist_id=portfolio_item.artist_profile.id,
            search_text=search_text
        )