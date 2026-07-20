from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class AppResponseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class WorkoutExerciseResponse(AppResponseModel):
    name: str
    target_body_area: str
    intensity_tier: str
    sets_reps: str
    how_to_notes: str


class WorkoutPlanResponse(AppResponseModel):
    target_body_area: str
    fitness_goal: str
    activity_level: str
    intensity_guidance: str
    volume_guidance: str
    exercises: list[WorkoutExerciseResponse]


class ShoppingListItemResponse(AppResponseModel):
    name: str
    category: str
    units: int
    estimated_unit_cost: Decimal
    estimated_total_cost: Decimal
    calories: int
    protein_grams: int
    carb_grams: int
    fat_grams: int


class MealPrepComboResponse(AppResponseModel):
    name: str
    items: list[str]
    estimated_cost_per_meal: Decimal
    calories: int
    protein_grams: int
    carb_grams: int
    fat_grams: int


class MealPrepPlanResponse(AppResponseModel):
    weekly_budget: Decimal
    estimated_weekly_cost: Decimal
    target_daily_calories: int
    target_weekly_calories: int
    shopping_list: dict[str, list[ShoppingListItemResponse]]
    sample_meal_combos: list[MealPrepComboResponse]


class BudgetCategoryBreakdownResponse(AppResponseModel):
    category: str
    allocated_amount: Decimal
    allocation_percent: int
    target_weekly_portions: int
    dollars_per_portion: Decimal
    grocery_need: str


class BudgetBreakdownResponse(AppResponseModel):
    weekly_budget: Decimal
    daily_budget: Decimal
    target_daily_calories: int
    target_weekly_calories: int
    dollars_per_1000_calories: Decimal
    budget_status: str
    budget_status_detail: str
    categories: list[BudgetCategoryBreakdownResponse]
