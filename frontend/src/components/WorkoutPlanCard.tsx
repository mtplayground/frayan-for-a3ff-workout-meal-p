import { AlertCircle, Dumbbell, RefreshCw, Sparkles } from "lucide-react";

import { getApiErrorMessages } from "../api/client";
import { useWorkoutPlan } from "../api/planHooks";
import type { PlanRequest, WorkoutExerciseResponse } from "../api/types";

type WorkoutPlanCardProps = {
  request: PlanRequest | null;
};

export function WorkoutPlanCard({ request }: WorkoutPlanCardProps) {
  const workoutPlan = useWorkoutPlan(request);
  const errorMessage = workoutPlan.isError
    ? getApiErrorMessages(workoutPlan.error).message
    : undefined;

  return (
    <article className="dashboard-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-ink-500">
            {workoutPlan.data ? formatLabel(workoutPlan.data.target_body_area) : "Workout plan"}
          </p>
          <h4 className="mt-1 text-lg font-semibold text-ink-900">Tailored routine</h4>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-50 text-ocean-700">
          <Dumbbell aria-hidden={true} className="h-5 w-5" />
        </div>
      </div>

      {!request ? <EmptyState /> : null}
      {request && workoutPlan.isLoading ? <LoadingState /> : null}
      {request && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={() => void workoutPlan.refetch()} />
      ) : null}
      {workoutPlan.data ? (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <PlanMetric label="Exercises" value={String(workoutPlan.data.exercises.length)} />
            <PlanMetric label="Intensity" value={formatLabel(workoutPlan.data.fitness_goal)} />
          </div>

          <div className="space-y-2 rounded-lg bg-ocean-50 p-4">
            <GuidanceRow label="Effort" value={workoutPlan.data.intensity_guidance} />
            <GuidanceRow label="Volume" value={workoutPlan.data.volume_guidance} />
          </div>

          <div className="space-y-3">
            {workoutPlan.data.exercises.map((exercise) => (
              <ExerciseRow key={exercise.name} exercise={exercise} />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-mist-200 bg-mist-50 p-4 text-sm font-medium text-ink-600">
      Enter valid profile inputs to load a routine.
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-5 space-y-3" aria-live="polite" aria-busy={true}>
      <div className="h-16 animate-pulse rounded-lg bg-mist-100" />
      <div className="h-20 animate-pulse rounded-lg bg-mist-100" />
      <div className="h-20 animate-pulse rounded-lg bg-mist-100" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden={true} className="mt-0.5 h-5 w-5 text-red-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-900">Workout could not load</p>
          <p className="mt-1 text-sm font-medium text-red-700">{message}</p>
        </div>
      </div>
      <button
        type="button"
        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
        onClick={onRetry}
      >
        <RefreshCw aria-hidden={true} className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-mist-50 p-3">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function GuidanceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <Sparkles aria-hidden={true} className="mt-0.5 h-4 w-4 shrink-0 text-ocean-700" />
      <p className="min-w-0 text-ink-700">
        <span className="font-semibold text-ink-900">{label}: </span>
        {value}
      </p>
    </div>
  );
}

function ExerciseRow({ exercise }: { exercise: WorkoutExerciseResponse }) {
  return (
    <div className="rounded-lg border border-mist-200 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h5 className="text-base font-semibold text-ink-900">{exercise.name}</h5>
          <p className="mt-1 text-sm font-medium text-ink-600">{exercise.sets_reps}</p>
        </div>
        <span className="w-fit rounded-md bg-leaf-50 px-2 py-1 text-xs font-semibold uppercase tracking-normal text-leaf-700">
          {formatLabel(exercise.intensity_tier)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-700">{exercise.how_to_notes}</p>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
