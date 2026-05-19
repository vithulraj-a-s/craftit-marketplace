from sqlalchemy import text
from sqlalchemy.orm import Session

from semantic_search.core.embeddings import (
    generate_embedding
)
from semantic_search.core.query_rewriter import (
    rewrite_query
)

def search_portfolios(
    db: Session,
    query: str
):

    query = rewrite_query(query)
    embedding = generate_embedding(query)

    sql = text("""
        SELECT
            portfolio_item_id,
            artist_id,
            search_text,
            1 - (
                embedding <=> CAST(:embedding AS vector)
            ) AS score

        FROM portfolio_search_index

        WHERE 1 - (
            embedding <=> CAST(:embedding AS vector)
        ) > 0.55

        ORDER BY embedding <=> CAST(:embedding AS vector)

        LIMIT 20;
    """)

    results = db.execute(
        sql,
        {
            "embedding": embedding
        }
    )

    return [
        {
            "portfolio_item_id": row.portfolio_item_id,
            "artist_id": row.artist_id,
            "search_text": row.search_text,
            "score": row.score
        }
        for row in results
    ]