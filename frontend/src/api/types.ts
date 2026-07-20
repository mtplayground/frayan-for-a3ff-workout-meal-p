export type TargetBodyArea = "lower_body" | "upper_body" | "core" | "full_body" | "mobility";

export type FitnessGoal = "fat_loss" | "muscle_gain" | "general_fitness";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type PlanRequest = {
  weight: number;
  height: number;
  target_body_area: TargetBodyArea;
  meal_prep_budget: string;
  fitness_goal?: FitnessGoal;
  activity_level?: ActivityLevel;
};

export type ErrorField = {
  field: string;
  code: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields: ErrorField[];
  };
};

export type WorkoutExerciseResponse = {
  name: string;
  target_body_area: string;
  intensity_tier: string;
  sets_reps: string;
  how_to_notes: string;
};

export type WorkoutPlanResponse = {
  target_body_area: string;
  fitness_goal: string;
  activity_level: string;
  intensity_guidance: string;
  volume_guidance: string;
  exercises: WorkoutExerciseResponse[];
};

export type ShoppingListItemResponse = {
  name: string;
  category: string;
  units: number;
  estimated_unit_cost: string;
  estimated_total_cost: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
};

export type MealPrepComboResponse = {
  name: string;
  items: string[];
  estimated_cost_per_meal: string;
  calories: number;
  protein_grams: number;
  carb_grams: number;
  fat_grams: number;
};

export type MealPrepPlanResponse = {
  weekly_budget: string;
  estimated_weekly_cost: string;
  target_daily_calories: number;
  target_weekly_calories: number;
  shopping_list: Record<string, ShoppingListItemResponse[]>;
  sample_meal_combos: MealPrepComboResponse[];
};

export type BudgetCategoryBreakdownResponse = {
  category: string;
  allocated_amount: string;
  allocation_percent: number;
  target_weekly_portions: number;
  dollars_per_portion: string;
  grocery_need: string;
};

export type BudgetBreakdownResponse = {
  weekly_budget: string;
  daily_budget: string;
  target_daily_calories: number;
  target_weekly_calories: number;
  dollars_per_1000_calories: string;
  budget_status: string;
  budget_status_detail: string;
  categories: BudgetCategoryBreakdownResponse[];
};
