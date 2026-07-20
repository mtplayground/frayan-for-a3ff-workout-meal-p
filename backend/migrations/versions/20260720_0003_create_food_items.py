"""create food items table

Revision ID: 20260720_0003
Revises: 20260720_0002
Create Date: 2026-07-20 00:03:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260720_0003"
down_revision: str | None = "20260720_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "food_items",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=24), nullable=False),
        sa.Column("estimated_unit_cost", sa.Numeric(precision=8, scale=2), nullable=False),
        sa.Column("calories_per_unit", sa.Integer(), nullable=False),
        sa.Column("protein_grams", sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column("carb_grams", sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column("fat_grams", sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "category IN ('proteins', 'carbs', 'veggies', 'staples')",
            name="ck_food_items_category",
        ),
        sa.CheckConstraint(
            "estimated_unit_cost >= 0",
            name="ck_food_items_estimated_unit_cost",
        ),
        sa.CheckConstraint(
            "calories_per_unit >= 0",
            name="ck_food_items_calories_per_unit",
        ),
        sa.CheckConstraint("protein_grams >= 0", name="ck_food_items_protein_grams"),
        sa.CheckConstraint("carb_grams >= 0", name="ck_food_items_carb_grams"),
        sa.CheckConstraint("fat_grams >= 0", name="ck_food_items_fat_grams"),
        sa.PrimaryKeyConstraint("id", name="pk_food_items"),
    )
    op.create_index("ix_food_items_category", "food_items", ["category"])
    op.create_index("ix_food_items_name", "food_items", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_food_items_name", table_name="food_items")
    op.drop_index("ix_food_items_category", table_name="food_items")
    op.drop_table("food_items")
