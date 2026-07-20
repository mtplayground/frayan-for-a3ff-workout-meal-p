from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.plan import PlanRequest
from app.schemas.plan_responses import (
    BudgetBreakdownResponse,
    MealPrepPlanResponse,
    WorkoutPlanResponse,
)
from app.services.budget import build_budget_breakdown
from app.services.meals import FoodCatalogEmptyError, build_meal_prep_plan
from app.services.workout import ExerciseLibraryEmptyError, select_workout

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.post("/workout", response_model=WorkoutPlanResponse)
def create_workout_plan(
    request: PlanRequest,
    db: Annotated[Session, Depends(get_db)],
) -> WorkoutPlanResponse:
    try:
        return WorkoutPlanResponse.model_validate(select_workout(request, db))
    except ExerciseLibraryEmptyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/meal-prep", response_model=MealPrepPlanResponse)
def create_meal_prep_plan(
    request: PlanRequest,
    db: Annotated[Session, Depends(get_db)],
) -> MealPrepPlanResponse:
    try:
        return MealPrepPlanResponse.model_validate(build_meal_prep_plan(request, db))
    except FoodCatalogEmptyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.post("/budget", response_model=BudgetBreakdownResponse)
def create_budget_breakdown(request: PlanRequest) -> BudgetBreakdownResponse:
    return BudgetBreakdownResponse.model_validate(build_budget_breakdown(request))
