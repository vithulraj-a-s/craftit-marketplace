from fastapi import FastAPI

from semantic_search.api.routes import router
from semantic_search.core.database import engine
from semantic_search.models.search_models import Base
from semantic_search.models.portfolio_search_models import PortfolioSearchIndex

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CraftIt AI Service"
)

app.include_router(router)


@app.get("/health")
def health_check():
    return {"status": "ok"}