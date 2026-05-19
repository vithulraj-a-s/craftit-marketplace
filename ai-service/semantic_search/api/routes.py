from fastapi import APIRouter
from sqlalchemy.orm import Session

from semantic_search.core.database import SessionLocal
from semantic_search.schemas.search_schema import ArtistIndexRequest
from semantic_search.services.indexing_service import upsert_artist_index
from semantic_search.schemas.search_schema import SearchQueryRequest
from semantic_search.services.search_service import semantic_search

from semantic_search.schemas.search_schema import (
    PortfolioIndexRequest,PortfolioSearchRequest
)

from semantic_search.services.portfolio_indexing_service import (
    upsert_portfolio_index
)

from semantic_search.services.portfolio_search_service import (
    search_portfolios
)
from semantic_search.core.query_rewriter import (
    rewrite_query
)

router = APIRouter()

@router.post("/index/artist")
def index_artist(payload: ArtistIndexRequest):

    db: Session = SessionLocal()

    try:
        upsert_artist_index(
            db=db,
            artist_id=payload.artist_id,
            search_text=payload.search_text
        )

        return {
            "status": "indexed"
        }

    finally:
        db.close()

@router.post("/search")
def search(payload: SearchQueryRequest):

    db: Session = SessionLocal()

    try:
        results = semantic_search(
            db=db,
            query=payload.query
        )

        return {
            "results": results
        }

    finally:
        db.close()

@router.post("/index/portfolio")
def index_portfolio(payload: PortfolioIndexRequest):

    db: Session = SessionLocal()

    try:

        upsert_portfolio_index(
            db=db,
            portfolio_item_id=payload.portfolio_item_id,
            artist_id=payload.artist_id,
            search_text=payload.search_text
        )

        return {
            "status": "indexed"
        }

    finally:
        db.close()

@router.post("/search/portfolio")
def semantic_portfolio_search(
    payload: PortfolioSearchRequest
):

    db: Session = SessionLocal()

    try:

        results = search_portfolios(
            db=db,
            query=payload.query
        )

        return {
            "results": results
        }

    finally:
        db.close()

@router.get("/rewrite-query")
def rewrite_query_test(query: str):

    rewritten = rewrite_query(query)

    return {
        "original": query,
        "rewritten": rewritten
    }