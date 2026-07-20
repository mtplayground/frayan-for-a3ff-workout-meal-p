from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from app.schemas.plan import PlanRequest
from app.services.baseline import CaloriePortionBaseline, calculate_baseline
from app.services.meals import CATEGORY_BUDGET_ALLOCATIONS, FOOD_CATEGORIES

CENT = Decimal("0.01")
PERCENT = Decimal("100")
CALORIE_UNIT = Decimal("1000")

TIGHT_DOLLARS_PER_1000_CALORIES = Decimal("4.25")
COMFORTABLE_DOLLARS_PER_1000_CALORIES = Decimal("5.00")

CATEGORY_NEEDS = {
    "proteins": "lean or budget proteins sized to weekly protein portions",
    "carbs": "batch-friendly carbohydrates for training fuel and satiety",
    "veggies": "fresh or frozen vegetables for volume and micronutrients",
    "staples": "pantry staples, sauces, fats, beans, and dairy add-ons",
}


@dataclass(frozen=True)
class BudgetCategoryBreakdown:
    category: str
    allocated_amount: Decimal
    allocation_percent: int
    target_weekly_portions: int
    dollars_per_portion: Decimal
    grocery_need: str


@dataclass(frozen=True)
class BudgetBreakdown:
    weekly_budget: Decimal
    daily_budget: Decimal
    target_daily_calories: int
    target_weekly_calories: int
    dollars_per_1000_calories: Decimal
    budget_status: str
    budget_status_detail: str
    categories: list[BudgetCategoryBreakdown]


def build_budget_breakdown(
    request: PlanRequest,
    baseline: CaloriePortionBaseline | None = None,
) -> BudgetBreakdown:
    calorie_baseline = baseline or calculate_baseline(request)
    weekly_budget = _to_money(request.meal_prep_budget)
    target_weekly_calories = calorie_baseline.target_daily_calories * 7
    dollars_per_1000_calories = _to_money(
        (weekly_budget / Decimal(target_weekly_calories)) * CALORIE_UNIT
    )
    budget_status = _budget_status(dollars_per_1000_calories)

    return BudgetBreakdown(
        weekly_budget=weekly_budget,
        daily_budget=_to_money(weekly_budget / Decimal("7")),
        target_daily_calories=calorie_baseline.target_daily_calories,
        target_weekly_calories=target_weekly_calories,
        dollars_per_1000_calories=dollars_per_1000_calories,
        budget_status=budget_status,
        budget_status_detail=_budget_status_detail(budget_status),
        categories=[
            _category_breakdown(category, weekly_budget, calorie_baseline)
            for category in FOOD_CATEGORIES
        ],
    )


def _category_breakdown(
    category: str,
    weekly_budget: Decimal,
    baseline: CaloriePortionBaseline,
) -> BudgetCategoryBreakdown:
    target_weekly_portions = _target_weekly_portions(category, baseline)
    allocated_amount = _to_money(weekly_budget * CATEGORY_BUDGET_ALLOCATIONS[category])

    return BudgetCategoryBreakdown(
        category=category,
        allocated_amount=allocated_amount,
        allocation_percent=round(CATEGORY_BUDGET_ALLOCATIONS[category] * PERCENT),
        target_weekly_portions=target_weekly_portions,
        dollars_per_portion=_to_money(allocated_amount / Decimal(target_weekly_portions)),
        grocery_need=CATEGORY_NEEDS[category],
    )


def _target_weekly_portions(category: str, baseline: CaloriePortionBaseline) -> int:
    daily_portions = {
        "proteins": baseline.protein_portions,
        "carbs": baseline.carb_portions,
        "veggies": baseline.veggie_portions,
        "staples": baseline.staple_portions,
    }
    return max(1, daily_portions[category] * 7)


def _budget_status(dollars_per_1000_calories: Decimal) -> str:
    if dollars_per_1000_calories < TIGHT_DOLLARS_PER_1000_CALORIES:
        return "tight"

    if dollars_per_1000_calories >= COMFORTABLE_DOLLARS_PER_1000_CALORIES:
        return "comfortable"

    return "balanced"


def _budget_status_detail(status: str) -> str:
    if status == "tight":
        return "Prioritize lower-cost staples, legumes, frozen vegetables, and repeatable batches."

    if status == "comfortable":
        return (
            "Budget supports the calorie target with room for variety and higher-convenience items."
        )

    return "Budget is workable for the calorie target with basic batch planning."


def _to_money(amount: Decimal) -> Decimal:
    return Decimal(amount).quantize(CENT, rounding=ROUND_HALF_UP)
