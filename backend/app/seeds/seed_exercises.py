import json
from pathlib import Path
from typing import Any

from sqlalchemy.dialects.postgresql import insert

from app.db.session import get_session_factory
from app.models.exercise import Exercise

DATA_PATH = Path(__file__).with_name("exercises.json")
REQUIRED_FIELDS = {
    "name",
    "target_body_area",
    "sets_reps_guidance",
    "intensity_tier",
    "how_to_notes",
}
INTENSITY_TIERS = {"low", "moderate", "high"}


def load_exercises(path: Path = DATA_PATH) -> list[dict[str, str]]:
    raw_data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw_data, list):
        raise ValueError("Exercise seed data must be a list of records.")

    records: list[dict[str, str]] = []
    for index, record in enumerate(raw_data, start=1):
        records.append(_validate_record(record, index))

    return records


def seed_exercises() -> int:
    records = load_exercises()
    statement = insert(Exercise).values(records)
    update_fields = {
        "target_body_area": statement.excluded.target_body_area,
        "sets_reps_guidance": statement.excluded.sets_reps_guidance,
        "intensity_tier": statement.excluded.intensity_tier,
        "how_to_notes": statement.excluded.how_to_notes,
    }
    statement = statement.on_conflict_do_update(
        index_elements=[Exercise.name],
        set_=update_fields,
    )

    with get_session_factory()() as session:
        session.execute(statement)
        session.commit()

    return len(records)


def _validate_record(record: Any, index: int) -> dict[str, str]:
    if not isinstance(record, dict):
        raise ValueError(f"Exercise seed record {index} must be an object.")

    missing_fields = sorted(REQUIRED_FIELDS - record.keys())
    if missing_fields:
        raise ValueError(f"Exercise seed record {index} is missing: {', '.join(missing_fields)}.")

    normalized: dict[str, str] = {}
    for field in REQUIRED_FIELDS:
        value = record[field]
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"Exercise seed record {index} has an invalid {field}.")
        normalized[field] = value.strip()

    if normalized["intensity_tier"] not in INTENSITY_TIERS:
        raise ValueError(
            f"Exercise seed record {index} has unsupported intensity tier: "
            f"{normalized['intensity_tier']}."
        )

    return normalized


def main() -> None:
    count = seed_exercises()
    print(f"Seeded {count} exercises.")


if __name__ == "__main__":
    main()
