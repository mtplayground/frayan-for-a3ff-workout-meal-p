from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Exercise(Base):
    __tablename__ = "exercises"
    __table_args__ = (
        CheckConstraint(
            "intensity_tier IN ('low', 'moderate', 'high')",
            name="ck_exercises_intensity_tier",
        ),
        UniqueConstraint("name", name="uq_exercises_name"),
        Index("ix_exercises_target_body_area", "target_body_area"),
        Index("ix_exercises_intensity_tier", "intensity_tier"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    target_body_area: Mapped[str] = mapped_column(String(80), nullable=False)
    sets_reps_guidance: Mapped[str] = mapped_column(String(160), nullable=False)
    intensity_tier: Mapped[str] = mapped_column(String(24), nullable=False)
    how_to_notes: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
