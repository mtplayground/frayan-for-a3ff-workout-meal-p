import { AlertCircle, Apple, RefreshCw, ShoppingBasket, UtensilsCrossed } from "lucide-react";

import { getApiErrorMessages } from "../api/client";
import { useMealPrepPlan } from "../api/planHooks";
import type { MealPrepComboResponse, PlanRequest, ShoppingListItemResponse } from "../api/types";

type MealPrepCardProps = {
  request: PlanRequest | null;
};

const shoppingCategoryOrder = ["proteins", "carbs", "veggies", "staples"];

export function MealPrepCard({ request }: MealPrepCardProps) {
  const mealPlan = useMealPrepPlan(request);
  const errorMessage = mealPlan.isError ? getApiErrorMessages(mealPlan.error).message : undefined;
  const shoppingCategories = mealPlan.data
    ? orderedShoppingCategories(mealPlan.data.shopping_list)
    : [];

  return (
    <article className="dashboard-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-ink-500">
            Weekly prep
          </p>
          <h4 className="mt-1 text-lg font-semibold text-ink-900">Meal prep plan</h4>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700">
          <Apple aria-hidden={true} className="h-5 w-5" />
        </div>
      </div>

      {!request ? <EmptyState /> : null}
      {request && mealPlan.isLoading ? <LoadingState /> : null}
      {request && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={() => void mealPlan.refetch()} />
      ) : null}
      {mealPlan.data ? (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <PlanMetric label="Weekly" value={formatMoney(mealPlan.data.estimated_weekly_cost)} />
            <PlanMetric label="Budget" value={formatMoney(mealPlan.data.weekly_budget)} />
            <PlanMetric
              label="Calories"
              value={formatNumber(mealPlan.data.target_daily_calories)}
            />
          </div>

          <section aria-labelledby="shopping-list-title" className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBasket aria-hidden={true} className="h-4 w-4 text-leaf-700" />
              <h5 id="shopping-list-title" className="text-sm font-semibold text-ink-900">
                Shopping list
              </h5>
            </div>
            <div className="space-y-3">
              {shoppingCategories.map(([category, items]) => (
                <ShoppingCategory key={category} category={category} items={items} />
              ))}
            </div>
          </section>

          <section aria-labelledby="meal-combos-title" className="space-y-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed aria-hidden={true} className="h-4 w-4 text-leaf-700" />
              <h5 id="meal-combos-title" className="text-sm font-semibold text-ink-900">
                Sample combos
              </h5>
            </div>
            <div className="space-y-3">
              {mealPlan.data.sample_meal_combos.length > 0 ? (
                mealPlan.data.sample_meal_combos.map((combo) => (
                  <MealCombo key={combo.name} combo={combo} />
                ))
              ) : (
                <LowBudgetEmptyState message="Budget is too tight for complete sample combos. Raise the weekly budget or repeat the lowest-cost staples shown above." />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-mist-200 bg-mist-50 p-4 text-sm font-medium text-ink-600">
      Enter valid profile inputs to load meal prep details.
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-5 space-y-3" aria-live="polite" aria-busy={true}>
      <div className="h-16 animate-pulse rounded-lg bg-mist-100" />
      <div className="h-28 animate-pulse rounded-lg bg-mist-100" />
      <div className="h-28 animate-pulse rounded-lg bg-mist-100" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden={true} className="mt-0.5 h-5 w-5 text-red-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-900">Meal prep could not load</p>
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
      <p className="truncate text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function ShoppingCategory({
  category,
  items,
}: {
  category: string;
  items: ShoppingListItemResponse[];
}) {
  return (
    <div className="rounded-lg border border-mist-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h6 className="text-sm font-semibold text-ink-900">{formatLabel(category)}</h6>
        <span className="rounded-md bg-leaf-50 px-2 py-1 text-xs font-semibold text-leaf-700">
          {items.length} items
        </span>
      </div>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.name}
              className="border-t border-mist-200 pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{item.name}</p>
                  <p className="mt-1 text-xs font-medium text-ink-500">
                    {item.units} units at {formatMoney(item.estimated_unit_cost)} each
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-ink-900">
                  {formatMoney(item.estimated_total_cost)}
                </p>
              </div>
              <p className="mt-2 text-xs font-medium text-ink-600">
                {formatNumber(item.calories)} cal | {item.protein_grams}g protein |{" "}
                {item.carb_grams}g carbs | {item.fat_grams}g fat
              </p>
            </div>
          ))}
        </div>
      ) : (
        <LowBudgetEmptyState
          message={`No ${formatLabel(category).toLowerCase()} fit this category budget. Increase the weekly budget or use pantry items you already have.`}
        />
      )}
    </div>
  );
}

function LowBudgetEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-800">
      {message}
    </div>
  );
}

function MealCombo({ combo }: { combo: MealPrepComboResponse }) {
  return (
    <div className="rounded-lg bg-leaf-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h6 className="text-sm font-semibold text-ink-900">{combo.name}</h6>
          <p className="mt-1 text-xs font-medium text-ink-600">
            {formatNumber(combo.calories)} cal | {combo.protein_grams}g protein
          </p>
        </div>
        <p className="shrink-0 rounded-md bg-white px-2 py-1 text-sm font-semibold text-leaf-700">
          {formatMoney(combo.estimated_cost_per_meal)}
        </p>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-700">{combo.items.join(", ")}</p>
    </div>
  );
}

function orderedShoppingCategories(
  shoppingList: Record<string, ShoppingListItemResponse[]>,
): Array<[string, ShoppingListItemResponse[]]> {
  return Object.entries(shoppingList).sort(([left], [right]) => {
    const leftIndex = shoppingCategoryOrder.indexOf(left);
    const rightIndex = shoppingCategoryOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

function formatMoney(value: string) {
  return `$${Number(value).toFixed(2)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
