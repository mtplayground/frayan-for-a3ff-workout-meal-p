from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.repositories.exercises import list_exercises_by_target_body_area
from app.schemas.plan import ActivityLevel, FitnessGoal, PlanRequest
from app.services.baseline import DEFAULT_ACTIVITY_LEVEL, DEFAULT_FITNESS_GOAL

LOW_ACTIVITY_LEVELS = {ActivityLevel.sedentary.value, ActivityLevel.light.value}
HIGH_ACTIVITY_LEVELS = {ActivityLevel.active.value, ActivityLevel.very_active.value}

INTENSITY_RANKS = {
    "low": 0,
    "moderate": 1,
    "high": 2,
}

ACTIVITY_EXERCISE_LIMITS = {
    ActivityLevel.sedentary.value: 3,
    ActivityLevel.light.value: 3,
    ActivityLevel.moderate.value: 4,
    ActivityLevel.active.value: 5,
    ActivityLevel.very_active.value: 5,
}


@dataclass(frozen=True)
class WorkoutExercise:
    name: str
    target_body_area: str
    intensity_tier: str
    sets_reps: str
    how_to_notes: str


@dataclass(frozen=True)
class WorkoutPlan:
    target_body_area: str
    fitness_goal: str
    activity_level: str
    intensity_guidance: str
    volume_guidance: str
    exercises: list[WorkoutExercise]


class ExerciseLibraryEmptyError(RuntimeError):
    pass


def select_workout(request: PlanRequest, session: Session) -> WorkoutPlan:
    target_body_area = str(request.target_body_area)
    activity_level = request.activity_level or DEFAULT_ACTIVITY_LEVEL
    fitness_goal = request.fitness_goal or DEFAULT_FITNESS_GOAL

    exercises = list_exercises_by_target_body_area(session, target_body_area)
    if not exercises:
        raise ExerciseLibraryEmptyError(
            f"No exercises are available for target body area: {target_body_area}."
        )

    selected = _select_exercises(
        exercises=exercises,
        activity_level=activity_level,
        fitness_goal=fitness_goal,
    )

    return WorkoutPlan(
        target_body_area=target_body_area,
        fitness_goal=fitness_goal,
        activity_level=activity_level,
        intensity_guidance=_intensity_guidance(activity_level, fitness_goal),
        volume_guidance=_volume_guidance(activity_level, fitness_goal),
        exercises=[
            WorkoutExercise(
                name=exercise.name,
                target_body_area=exercise.target_body_area,
                intensity_tier=exercise.intensity_tier,
                sets_reps=_adjust_sets_reps(
                    exercise.sets_reps_guidance, activity_level, fitness_goal
                ),
                how_to_notes=exercise.how_to_notes,
            )
            for exercise in selected
        ],
    )


def _select_exercises(
    *,
    exercises: list[Exercise],
    activity_level: str,
    fitness_goal: str,
) -> list[Exercise]:
    limit = min(ACTIVITY_EXERCISE_LIMITS[activity_level], len(exercises))
    ordered = sorted(
        exercises,
        key=lambda exercise: (
            _intensity_preference_rank(exercise.intensity_tier, activity_level, fitness_goal),
            exercise.name,
        ),
    )
    return ordered[:limit]


def _intensity_preference_rank(
    intensity_tier: str,
    activity_level: str,
    fitness_goal: str,
) -> int:
    intensity_rank = INTENSITY_RANKS[intensity_tier]
    if activity_level in LOW_ACTIVITY_LEVELS:
        return intensity_rank

    if fitness_goal == FitnessGoal.muscle_gain.value:
        return abs(intensity_rank - INTENSITY_RANKS["moderate"])

    if fitness_goal == FitnessGoal.fat_loss.value and activity_level in HIGH_ACTIVITY_LEVELS:
        return abs(intensity_rank - INTENSITY_RANKS["moderate"])

    return intensity_rank


def _adjust_sets_reps(base_guidance: str, activity_level: str, fitness_goal: str) -> str:
    if activity_level in LOW_ACTIVITY_LEVELS:
        return f"{base_guidance}; start at the lower end and rest 60-90 seconds."

    if fitness_goal == FitnessGoal.muscle_gain.value:
        return f"{base_guidance}; add one set when all reps feel controlled."

    if fitness_goal == FitnessGoal.fat_loss.value:
        return f"{base_guidance}; keep rest near 30-60 seconds while form stays steady."

    if activity_level in HIGH_ACTIVITY_LEVELS:
        return f"{base_guidance}; use the upper end if technique stays consistent."

    return base_guidance


def _intensity_guidance(activity_level: str, fitness_goal: str) -> str:
    if activity_level in LOW_ACTIVITY_LEVELS:
        return "Keep effort conversational and stop before form breaks down."

    if fitness_goal == FitnessGoal.muscle_gain.value:
        return "Use controlled reps and choose the hardest variation that still feels stable."

    if fitness_goal == FitnessGoal.fat_loss.value:
        return "Use steady pacing with short rests rather than rushing the movements."

    return "Use moderate effort and leave a few good reps in reserve."


def _volume_guidance(activity_level: str, fitness_goal: str) -> str:
    if activity_level in LOW_ACTIVITY_LEVELS:
        return "Complete the listed routine 2-3 days per week with a recovery day between sessions."

    if fitness_goal == FitnessGoal.muscle_gain.value:
        return "Complete the routine 3-4 days per week and increase volume gradually."

    if fitness_goal == FitnessGoal.fat_loss.value:
        return "Complete the routine 3-5 days per week, keeping sessions repeatable."

    return "Complete the routine 3 days per week and adjust based on recovery."
