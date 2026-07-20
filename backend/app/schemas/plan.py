from decimal import Decimal
from enum import StrEnum
from typing import Annotated, Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TargetBodyArea(StrEnum):
    lower_body = "lower_body"
    upper_body = "upper_body"
    core = "core"
    full_body = "full_body"
    mobility = "mobility"


class FitnessGoal(StrEnum):
    fat_loss = "fat_loss"
    muscle_gain = "muscle_gain"
    general_fitness = "general_fitness"


class ActivityLevel(StrEnum):
    sedentary = "sedentary"
    light = "light"
    moderate = "moderate"
    active = "active"
    very_active = "very_active"


class PlanRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
        use_enum_values=True,
    )

    weight: Annotated[
        float,
        Field(
            ge=30,
            le=300,
            description="Body weight in kilograms.",
        ),
    ]
    height: Annotated[
        float,
        Field(
            ge=100,
            le=250,
            description="Height in centimeters.",
        ),
    ]
    target_body_area: TargetBodyArea
    meal_prep_budget: Annotated[
        Decimal,
        Field(
            ge=Decimal("5.00"),
            le=Decimal("1000.00"),
            max_digits=8,
            decimal_places=2,
            description="Meal prep budget in USD.",
        ),
    ]
    fitness_goal: FitnessGoal | None = None
    activity_level: ActivityLevel | None = None

    @field_validator("target_body_area", "fitness_goal", "activity_level", mode="before")
    @classmethod
    def normalize_allowed_value(cls, value: Any) -> Any:
        if value is None:
            return value

        if isinstance(value, str):
            return value.strip().lower().replace("-", "_").replace(" ", "_")

        return value
