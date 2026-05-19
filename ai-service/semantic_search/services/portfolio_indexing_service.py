from sqlalchemy.orm import Session

from semantic_search.core.embeddings import generate_embedding

from semantic_search.models.portfolio_search_models import (
    PortfolioSearchIndex
)


def upsert_portfolio_index(
    db: Session,
    portfolio_item_id: int,
    artist_id: int,
    search_text: str
):

    embedding = generate_embedding(search_text)

    existing = db.query(
        PortfolioSearchIndex
    ).filter(
        PortfolioSearchIndex.portfolio_item_id == portfolio_item_id
    ).first()

    if existing:

        existing.search_text = search_text
        existing.embedding = embedding

    else:

        new_entry = PortfolioSearchIndex(
            portfolio_item_id=portfolio_item_id,
            artist_id=artist_id,
            search_text=search_text,
            embedding=embedding
        )

        db.add(new_entry)

    db.commit()