import { useQuery } from "@tanstack/react-query";

import { ApiClientError, postPlanResult } from "./client";
import type {
  BudgetBreakdownResponse,
  MealPrepPlanResponse,
  PlanRequest,
  WorkoutPlanResponse,
} from "./types";

const PLAN_STALE_TIME_MS = 30_000;

export function useWorkoutPlan(request: PlanRequest | null) {
  return useQuery<WorkoutPlanResponse, ApiClientError>({
    queryKey: ["plans", "workout", workoutRequestKey(request)],
    queryFn: ({ signal }) =>
      requirePlanRequest(request, "workout").then((body) =>
        postPlanResult<WorkoutPlanResponse>("/plans/workout", body, signal),
      ),
    enabled: Boolean(request),
    placeholderData: (previousData) => previousData,
    staleTime: PLAN_STALE_TIME_MS,
  });
}

export function useMealPrepPlan(request: PlanRequest | null) {
  return useQuery<MealPrepPlanResponse, ApiClientError>({
    queryKey: ["plans", "meal-prep", mealAndBudgetRequestKey(request)],
    queryFn: ({ signal }) =>
      requirePlanRequest(request, "meal-prep").then((body) =>
        postPlanResult<MealPrepPlanResponse>("/plans/meal-prep", body, signal),
      ),
    enabled: Boolean(request),
    placeholderData: (previousData) => previousData,
    staleTime: PLAN_STALE_TIME_MS,
  });
}

export function useBudgetBreakdown(request: PlanRequest | null) {
  return useQuery<BudgetBreakdownResponse, ApiClientError>({
    queryKey: ["plans", "budget", mealAndBudgetRequestKey(request)],
    queryFn: ({ signal }) =>
      requirePlanRequest(request, "budget").then((body) =>
        postPlanResult<BudgetBreakdownResponse>("/plans/budget", body, signal),
      ),
    enabled: Boolean(request),
    placeholderData: (previousData) => previousData,
    staleTime: PLAN_STALE_TIME_MS,
  });
}

function workoutRequestKey(request: PlanRequest | null) {
  if (!request) {
    return null;
  }

  return {
    target_body_area: request.target_body_area,
    fitness_goal: request.fitness_goal ?? null,
    activity_level: request.activity_level ?? null,
  };
}

function mealAndBudgetRequestKey(request: PlanRequest | null) {
  if (!request) {
    return null;
  }

  return {
    weight: request.weight,
    height: request.height,
    meal_prep_budget: request.meal_prep_budget,
    fitness_goal: request.fitness_goal ?? null,
    activity_level: request.activity_level ?? null,
  };
}

async function requirePlanRequest(request: PlanRequest | null, card: string): Promise<PlanRequest> {
  if (!request) {
    throw new ApiClientError({
      status: 0,
      code: "missing_plan_request",
      message: `Plan inputs are required before loading the ${card} card.`,
    });
  }

  return request;
}
