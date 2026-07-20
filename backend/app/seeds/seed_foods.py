import json
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

from sqlalchemy.dialects.postgresql import insert

from app.db.session import get_session_factory
from app.models.food import FoodItem

DATA_PATH = Path(__file__).with_name("foods.json")
CATEGORIES = {"proteins", "carbs", "veggies", "staples"}
REQUIRED_FIELDS = {
    "name",
    "category",
    "estimated_unit_cost",
    "calories_per_unit",
    "protein_grams",
    "carb_grams",
    "fat_grams",
}
DECIMAL_FIELDS = {"estimated_unit_cost", "protein_grams", "carb_grams", "fat_grams"}

FoodSeedRecord = dict[str, str | int | Decimal]


def load_foods(path: Path = DATA_PATH) -> list[FoodSeedRecord]:
    raw_data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw_data, list):
        raise ValueError("Food seed data must be a list of records.")

    records: list[FoodSeedRecord] = []
    for index, record in enumerate(raw_data, start=1):
        records.append(_validate_record(record, index))

    return records


def seed_foods() -> int:
    records = load_foods()
    statement = insert(FoodItem).values(records)
    update_fields = {
        "category": statement.excluded.category,
        "estimated_unit_cost": statement.excluded.estimated_unit_cost,
        "calories_per_unit": statement.excluded.calories_per_unit,
        "protein_grams": statement.excluded.protein_grams,
        "carb_grams": statement.excluded.carb_grams,
        "fat_grams": statement.excluded.fat_grams,
    }
    statement = statement.on_conflict_do_update(
        index_elements=[FoodItem.name],
        set_=update_fields,
    )

    with get_session_factory()() as session:
        session.execute(statement)
        session.commit()

    return len(records)


def _validate_record(record: Any, index: int) -> FoodSeedRecord:
    if not isinstance(record, dict):
        raise ValueError(f"Food seed record {index} must be an object.")

    missing_fields = sorted(REQUIRED_FIELDS - record.keys())
    if missing_fields:
        raise ValueError(f"Food seed record {index} is missing: {', '.join(missing_fields)}.")

    name = _required_string(record["name"], "name", index)
    category = _required_string(record["category"], "category", index)
    if category not in CATEGORIES:
        raise ValueError(f"Food seed record {index} has unsupported category: {category}.")

    calories = record["calories_per_unit"]
    if not isinstance(calories, int) or calories < 0:
        raise ValueError(f"Food seed record {index} has an invalid calories_per_unit.")

    normalized: FoodSeedRecord = {
        "name": name,
        "category": category,
        "calories_per_unit": calories,
    }
    for field in DECIMAL_FIELDS:
        normalized[field] = _non_negative_decimal(record[field], field, index)

    return normalized


def _required_string(value: Any, field: str, index: int) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Food seed record {index} has an invalid {field}.")

    return value.strip()


def _non_negative_decimal(value: Any, field: str, index: int) -> Decimal:
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Food seed record {index} has an invalid {field}.") from exc

    if amount < 0:
        raise ValueError(f"Food seed record {index} has a negative {field}.")

    return amount


def main() -> None:
    count = seed_foods()
    print(f"Seeded {count} food items.")


if __name__ == "__main__":
    main()
