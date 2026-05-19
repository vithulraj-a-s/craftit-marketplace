from sqlalchemy import text
from sqlalchemy.orm import Session

from semantic_search.core.embeddings import generate_embedding

from semantic_search.core.query_rewriter import (
    rewrite_query
)


def semantic_search(db: Session,query: str):
    query = rewrite_query(query)
    query_embedding = generate_embedding(query)
    sql = text("""
            SELECT
                artist_id,
                1 - (embedding <=> CAST(:embedding AS vector)) AS score
            FROM artist_search_index
            WHERE 1 - (embedding <=> CAST(:embedding AS vector)) > 0.55
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT 20;
        """)

    results = db.execute(
        sql,
        {
            "embedding": query_embedding
        }
    )

    return [
        {
            "artist_id": row.artist_id,
            "score": float(row.score)
        }
        for row in results
    ]