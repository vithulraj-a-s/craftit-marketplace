from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func

from pgvector.sqlalchemy import Vector

from semantic_search.core.database import Base


class ArtistSearchIndex(Base):
    __tablename__ = "artist_search_index"

    id = Column(Integer, primary_key=True, index=True)

    artist_id = Column(Integer, unique=True, nullable=False)

    search_text = Column(Text, nullable=False)

    embedding = Column(Vector(3072))

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
