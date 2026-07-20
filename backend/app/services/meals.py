from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy.orm import Session

from app.models.food import FoodItem
from app.repositories.foods import list_food_items
from app.schemas.plan import PlanRequest
from app.services.baseline import CaloriePortionBaseline, calculate_baseline

FOOD_CATEGORIES = ("proteins", "carbs", "veggies", "staples")
CENT = Decimal("0.01")

CATEGORY_BUDGET_ALLOCATIONS = {
    "proteins": Decimal("0.40"),
    "carbs": Decimal("0.25"),
    "veggies": Decimal("0.20"),
    "staples": Decimal("0.15"),
}

MIN_COMBO_COUNT = 3


@dataclass(frozen=True)
class ShoppingListItem:
    name: str
    category: str
    units: int
    estimated_unit_cost: Decimal
    estimated_total_cost: Decimal
    calories: int
    protein_grams: int
    carb_grams: int
    fat_grams: int


@dataclass(frozen=True)
class MealPrepCombo:
    name: str
    items: list[str]
    estimated_cost_per_meal: Decimal
    calories: int
    protein_grams: int
    carb_grams: int
    fat_grams: int


@dataclass(frozen=True)
class MealPrepPlan:
    weekly_budget: Decimal
    estimated_weekly_cost: Decimal
    target_daily_calories: int
    target_weekly_calories: int
    shopping_list: dict[str, list[ShoppingListItem]]
    sample_meal_combos: list[MealPrepCombo]


class FoodCatalogEmptyError(RuntimeError):
    pass


def build_meal_prep_plan(
    request: PlanRequest,
    session: Session,
    baseline: CaloriePortionBaseline | None = None,
) -> MealPrepPlan:
    calorie_baseline = baseline or calculate_baseline(request)
    weekly_budget = _to_money(request.meal_prep_budget)
    foods_by_category = _group_foods_by_category(list_food_items(session))

    shopping_list = {
        category: _build_category_shopping_list(
            category=category,
            foods=foods_by_category[category],
            target_units=_target_units_for_category(category, calorie_baseline),
            category_budget=_category_budget(weekly_budget, category),
        )
        for category in FOOD_CATEGORIES
    }
    estimated_weekly_cost = _to_money(
        sum(
            (item.estimated_total_cost for items in shopping_list.values() for item in items),
            Decimal("0"),
        )
    )

    return MealPrepPlan(
        weekly_budget=weekly_budget,
        estimated_weekly_cost=estimated_weekly_cost,
        target_daily_calories=calorie_baseline.target_daily_calories,
        target_weekly_calories=calorie_baseline.target_daily_calories * 7,
        shopping_list=shopping_list,
        sample_meal_combos=_build_sample_combos(shopping_list),
    )


def _group_foods_by_category(foods: list[FoodItem]) -> dict[str, list[FoodItem]]:
    grouped = {category: [] for category in FOOD_CATEGORIES}
    for food in foods:
        if food.category in grouped:
            grouped[food.category].append(food)

    missing_categories = [
        category for category, category_foods in grouped.items() if not category_foods
    ]
    if missing_categories:
        missing = ", ".join(missing_categories)
        raise FoodCatalogEmptyError(f"Food catalog is missing categories: {missing}.")

    return {
        category: sorted(category_foods, key=lambda food: _food_sort_key(food, category))
        for category, category_foods in grouped.items()
    }


def _build_category_shopping_list(
    *,
    category: str,
    foods: list[FoodItem],
    target_units: int,
    category_budget: Decimal,
) -> list[ShoppingListItem]:
    selected_units: dict[str, int] = {}
    selected_foods: dict[str, FoodItem] = {}
    spent = Decimal("0")
    candidate_count = min(3, len(foods))
    candidates = foods[:candidate_count]

    for unit_index in range(target_units):
        food = candidates[unit_index % candidate_count]
        unit_cost = _to_money(food.estimated_unit_cost)
        if spent + unit_cost > category_budget:
            break

        selected_units[food.name] = selected_units.get(food.name, 0) + 1
        selected_foods[food.name] = food
        spent += unit_cost

    if not selected_units:
        cheapest = foods[0]
        unit_cost = _to_money(cheapest.estimated_unit_cost)
        if unit_cost <= category_budget:
            selected_units[cheapest.name] = 1
            selected_foods[cheapest.name] = cheapest

    return [
        _shopping_list_item(selected_foods[name], units)
        for name, units in sorted(selected_units.items())
    ]


def _build_sample_combos(
    shopping_list: dict[str, list[ShoppingListItem]],
) -> list[MealPrepCombo]:
    category_items = [shopping_list[category] for category in FOOD_CATEGORIES]
    if any(not items for items in category_items):
        return []

    combos: list[MealPrepCombo] = []
    for index in range(MIN_COMBO_COUNT):
        items = [category[index % len(category)] for category in category_items]
        combos.append(
            MealPrepCombo(
                name=_combo_name(items),
                items=[item.name for item in items],
                estimated_cost_per_meal=_to_money(
                    sum((item.estimated_unit_cost for item in items), Decimal("0"))
                ),
                calories=sum(item.calories // item.units for item in items),
                protein_grams=sum(item.protein_grams // item.units for item in items),
                carb_grams=sum(item.carb_grams // item.units for item in items),
                fat_grams=sum(item.fat_grams // item.units for item in items),
            )
        )

    return combos


def _shopping_list_item(food: FoodItem, units: int) -> ShoppingListItem:
    unit_cost = _to_money(food.estimated_unit_cost)
    return ShoppingListItem(
        name=food.name,
        category=food.category,
        units=units,
        estimated_unit_cost=unit_cost,
        estimated_total_cost=_to_money(unit_cost * units),
        calories=food.calories_per_unit * units,
        protein_grams=round(Decimal(food.protein_grams) * units),
        carb_grams=round(Decimal(food.carb_grams) * units),
        fat_grams=round(Decimal(food.fat_grams) * units),
    )


def _target_units_for_category(
    category: str,
    baseline: CaloriePortionBaseline,
) -> int:
    daily_portions = {
        "proteins": baseline.protein_portions,
        "carbs": baseline.carb_portions,
        "veggies": baseline.veggie_portions,
        "staples": baseline.staple_portions,
    }
    return max(1, daily_portions[category] * 7)


def _category_budget(weekly_budget: Decimal, category: str) -> Decimal:
    return _to_money(weekly_budget * CATEGORY_BUDGET_ALLOCATIONS[category])


def _food_sort_key(food: FoodItem, category: str) -> tuple[Decimal, Decimal, str]:
    unit_cost = _to_money(food.estimated_unit_cost)
    if category == "proteins":
        primary_macro = Decimal(food.protein_grams) or Decimal("1")
    elif category == "carbs":
        primary_macro = Decimal(food.carb_grams) or Decimal("1")
    elif category == "staples":
        primary_macro = Decimal(food.fat_grams) or Decimal(food.calories_per_unit) or Decimal("1")
    else:
        primary_macro = Decimal(food.calories_per_unit) or Decimal("1")

    return (unit_cost / primary_macro, unit_cost, food.name)


def _combo_name(items: list[ShoppingListItem]) -> str:
    protein, carb, veggie, staple = items
    return f"{protein.name}, {carb.name}, {veggie.name}, and {staple.name}"


def _to_money(amount: Decimal) -> Decimal:
    return Decimal(amount).quantize(CENT, rounding=ROUND_HALF_UP)
