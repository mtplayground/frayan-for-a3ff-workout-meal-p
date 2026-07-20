from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FoodItem(Base):
    __tablename__ = "food_items"
    __table_args__ = (
        CheckConstraint(
            "category IN ('proteins', 'carbs', 'veggies', 'staples')",
            name="ck_food_items_category",
        ),
        CheckConstraint("estimated_unit_cost >= 0", name="ck_food_items_estimated_unit_cost"),
        CheckConstraint("calories_per_unit >= 0", name="ck_food_items_calories_per_unit"),
        CheckConstraint("protein_grams >= 0", name="ck_food_items_protein_grams"),
        CheckConstraint("carb_grams >= 0", name="ck_food_items_carb_grams"),
        CheckConstraint("fat_grams >= 0", name="ck_food_items_fat_grams"),
        Index("ix_food_items_category", "category"),
        Index("ix_food_items_name", "name", unique=True),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(24), nullable=False)
    estimated_unit_cost: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    calories_per_unit: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_grams: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    carb_grams: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    fat_grams: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
