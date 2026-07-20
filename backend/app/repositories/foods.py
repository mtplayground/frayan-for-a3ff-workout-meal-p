from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.food import FoodItem


def list_food_items(session: Session) -> list[FoodItem]:
    statement = select(FoodItem).order_by(
        FoodItem.category,
        FoodItem.estimated_unit_cost,
        FoodItem.name,
    )
    return list(session.scalars(statement))
