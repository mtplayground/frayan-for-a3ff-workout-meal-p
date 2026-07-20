from dataclasses import dataclass
from math import ceil

from app.schemas.plan import ActivityLevel, FitnessGoal, PlanRequest

ASSUMED_ADULT_AGE = 35
MIN_DAILY_CALORIES = 1200
MAX_DAILY_CALORIES = 4200

DEFAULT_ACTIVITY_LEVEL = ActivityLevel.moderate.value
DEFAULT_FITNESS_GOAL = FitnessGoal.general_fitness.value

ACTIVITY_MULTIPLIERS = {
    ActivityLevel.sedentary.value: 1.2,
    ActivityLevel.light.value: 1.35,
    ActivityLevel.moderate.value: 1.5,
    ActivityLevel.active.value: 1.65,
    ActivityLevel.very_active.value: 1.8,
}

GOAL_CALORIE_MULTIPLIERS = {
    FitnessGoal.fat_loss.value: 0.88,
    FitnessGoal.muscle_gain.value: 1.1,
    FitnessGoal.general_fitness.value: 1.0,
}

GOAL_PROTEIN_GRAMS_PER_KG = {
    FitnessGoal.fat_loss.value: 1.8,
    FitnessGoal.muscle_gain.value: 2.0,
    FitnessGoal.general_fitness.value: 1.6,
}


@dataclass(frozen=True)
class CaloriePortionBaseline:
    estimated_maintenance_calories: int
    target_daily_calories: int
    protein_grams: int
    carb_grams: int
    fat_grams: int
    protein_portions: int
    carb_portions: int
    veggie_portions: int
    staple_portions: int
    activity_level: str
    fitness_goal: str


def calculate_baseline(request: PlanRequest) -> CaloriePortionBaseline:
    activity_level = _value_or_default(request.activity_level, DEFAULT_ACTIVITY_LEVEL)
    fitness_goal = _value_or_default(request.fitness_goal, DEFAULT_FITNESS_GOAL)

    maintenance_calories = _estimate_maintenance_calories(
        weight_kg=request.weight,
        height_cm=request.height,
        activity_level=activity_level,
    )
    target_calories = _clamp_daily_calories(
        round(maintenance_calories * GOAL_CALORIE_MULTIPLIERS[fitness_goal])
    )
    protein_grams = round(request.weight * GOAL_PROTEIN_GRAMS_PER_KG[fitness_goal])
    fat_grams = max(35, round((target_calories * 0.25) / 9))
    carb_grams = max(75, round((target_calories - (protein_grams * 4) - (fat_grams * 9)) / 4))

    return CaloriePortionBaseline(
        estimated_maintenance_calories=maintenance_calories,
        target_daily_calories=target_calories,
        protein_grams=protein_grams,
        carb_grams=carb_grams,
        fat_grams=fat_grams,
        protein_portions=ceil(protein_grams / 25),
        carb_portions=ceil(carb_grams / 35),
        veggie_portions=max(3, round(target_calories / 600)),
        staple_portions=max(2, ceil(fat_grams / 14)),
        activity_level=activity_level,
        fitness_goal=fitness_goal,
    )


def _estimate_maintenance_calories(
    *,
    weight_kg: float,
    height_cm: float,
    activity_level: str,
) -> int:
    resting_calories = (10 * weight_kg) + (6.25 * height_cm) - (5 * ASSUMED_ADULT_AGE)
    return round(resting_calories * ACTIVITY_MULTIPLIERS[activity_level])


def _clamp_daily_calories(calories: int) -> int:
    return min(MAX_DAILY_CALORIES, max(MIN_DAILY_CALORIES, calories))


def _value_or_default(value: str | None, default: str) -> str:
    return value or default
