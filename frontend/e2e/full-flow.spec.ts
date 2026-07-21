import { expect, test } from "@playwright/test";

type PlanRequest = {
  weight: number;
  height: number;
  target_body_area: string;
  meal_prep_budget: string;
  fitness_goal?: string;
  activity_level?: string;
};

test("populates all plan cards and updates only affected cards on input change", async ({
  page,
}) => {
  const requestCounts = {
    workout: 0,
    mealPrep: 0,
    budget: 0,
  };

  await page.route("**/api/plans/workout", async (route) => {
    requestCounts.workout += 1;
    const request = route.request().postDataJSON() as PlanRequest;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(workoutResponse(request)),
    });
  });

  await page.route("**/api/plans/meal-prep", async (route) => {
    requestCounts.mealPrep += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mealPrepResponse()),
    });
  });

  await page.route("**/api/plans/budget", async (route) => {
    requestCounts.budget += 1;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(budgetResponse()),
    });
  });

  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Tailored routine" })).toBeVisible();
  await expect(page.getByText("Incline Push-up")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Meal prep plan" })).toBeVisible();
  await expect(page.getByText("Chicken Rice Bowl")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Budget breakdown" })).toBeVisible();
  await expect(page.getByText("Comfortable")).toBeVisible();
  await expect(page.getByText("Budget supports the calorie target")).toBeVisible();

  const initialCounts = { ...requestCounts };

  await page.getByLabel("Target body area").selectOption("lower_body");

  await expect(page.getByText("Reverse Lunge")).toBeVisible();
  await expect(page.getByText("Incline Push-up")).not.toBeVisible();
  await expect.poll(() => requestCounts.workout).toBeGreaterThan(initialCounts.workout);
  expect(requestCounts.mealPrep).toBe(initialCounts.mealPrep);
  expect(requestCounts.budget).toBe(initialCounts.budget);
});

function workoutResponse(request: PlanRequest) {
  const isLowerBody = request.target_body_area === "lower_body";

  return {
    target_body_area: request.target_body_area,
    fitness_goal: request.fitness_goal ?? "general_fitness",
    activity_level: request.activity_level ?? "moderate",
    intensity_guidance: isLowerBody
      ? "Drive through the whole foot and keep reps controlled."
      : "Use controlled reps and choose the hardest variation that still feels stable.",
    volume_guidance: isLowerBody
      ? "Complete this lower-body routine three days per week."
      : "Complete the routine three to four days per week and increase volume gradually.",
    exercises: [
      {
        name: isLowerBody ? "Reverse Lunge" : "Incline Push-up",
        target_body_area: request.target_body_area,
        intensity_tier: "moderate",
        sets_reps: isLowerBody ? "3 sets of 8 reps per side" : "3 sets of 8-12 reps",
        how_to_notes: isLowerBody
          ? "Step back, lower under control, and keep the front knee tracking over the toes."
          : "Keep a straight line from shoulders to heels and lower with steady control.",
      },
    ],
  };
}

function mealPrepResponse() {
  return {
    weekly_budget: "125.00",
    estimated_weekly_cost: "118.60",
    target_daily_calories: 2350,
    target_weekly_calories: 16450,
    shopping_list: {
      proteins: [shoppingItem("Chicken breast", "proteins", 6, "3.25", "19.50", 990, 186, 0, 18)],
      carbs: [shoppingItem("Brown rice", "carbs", 5, "1.10", "5.50", 1080, 20, 225, 5)],
      veggies: [shoppingItem("Frozen broccoli", "veggies", 5, "1.35", "6.75", 250, 15, 40, 0)],
      staples: [shoppingItem("Olive oil", "staples", 2, "4.00", "8.00", 480, 0, 0, 54)],
    },
    sample_meal_combos: [
      {
        name: "Chicken Rice Bowl",
        items: ["Chicken breast", "Brown rice", "Frozen broccoli", "Olive oil"],
        estimated_cost_per_meal: "3.95",
        calories: 620,
        protein_grams: 42,
        carb_grams: 58,
        fat_grams: 18,
      },
    ],
  };
}

function budgetResponse() {
  return {
    weekly_budget: "125.00",
    daily_budget: "17.86",
    target_daily_calories: 2350,
    target_weekly_calories: 16450,
    dollars_per_1000_calories: "7.60",
    budget_status: "comfortable",
    budget_status_detail:
      "Budget supports the calorie target with room for variety and higher-convenience items.",
    categories: [
      {
        category: "proteins",
        allocated_amount: "50.00",
        allocation_percent: 40,
        target_weekly_portions: 42,
        dollars_per_portion: "1.19",
        grocery_need: "lean or budget proteins sized to weekly protein portions",
      },
      {
        category: "carbs",
        allocated_amount: "31.25",
        allocation_percent: 25,
        target_weekly_portions: 35,
        dollars_per_portion: "0.89",
        grocery_need: "batch-friendly carbohydrates for training fuel and satiety",
      },
    ],
  };
}

function shoppingItem(
  name: string,
  category: string,
  units: number,
  estimated_unit_cost: string,
  estimated_total_cost: string,
  calories: number,
  protein_grams: number,
  carb_grams: number,
  fat_grams: number,
) {
  return {
    name,
    category,
    units,
    estimated_unit_cost,
    estimated_total_cost,
    calories,
    protein_grams,
    carb_grams,
    fat_grams,
  };
}
