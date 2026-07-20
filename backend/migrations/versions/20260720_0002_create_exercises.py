"""create exercises table

Revision ID: 20260720_0002
Revises: 20260720_0001
Create Date: 2026-07-20 00:02:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260720_0002"
down_revision: str | None = "20260720_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "exercises",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("target_body_area", sa.String(length=80), nullable=False),
        sa.Column("sets_reps_guidance", sa.String(length=160), nullable=False),
        sa.Column("intensity_tier", sa.String(length=24), nullable=False),
        sa.Column("how_to_notes", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "intensity_tier IN ('low', 'moderate', 'high')",
            name="ck_exercises_intensity_tier",
        ),
        sa.PrimaryKeyConstraint("id", name="pk_exercises"),
        sa.UniqueConstraint("name", name="uq_exercises_name"),
    )
    op.create_index("ix_exercises_target_body_area", "exercises", ["target_body_area"])
    op.create_index("ix_exercises_intensity_tier", "exercises", ["intensity_tier"])


def downgrade() -> None:
    op.drop_index("ix_exercises_intensity_tier", table_name="exercises")
    op.drop_index("ix_exercises_target_body_area", table_name="exercises")
    op.drop_table("exercises")
