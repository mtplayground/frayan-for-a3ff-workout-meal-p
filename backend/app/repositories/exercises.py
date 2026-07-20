from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exercise import Exercise


def list_exercises_by_target_body_area(
    session: Session,
    target_body_area: str,
) -> list[Exercise]:
    statement = (
        select(Exercise)
        .where(Exercise.target_body_area == target_body_area)
        .order_by(Exercise.intensity_tier, Exercise.name)
    )
    return list(session.scalars(statement))
