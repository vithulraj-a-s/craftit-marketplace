from pydantic import BaseModel

class ArtistIndexRequest(BaseModel):
    artist_id: int
    search_text: str

class SearchQueryRequest(BaseModel):
    query: str

class PortfolioIndexRequest(BaseModel):
    portfolio_item_id: int
    artist_id: int
    search_text: str

class PortfolioSearchRequest(BaseModel):

    query: str