import { AlertCircle, BadgeDollarSign, RefreshCw, Scale, WalletCards } from "lucide-react";

import { getApiErrorMessages } from "../api/client";
import { useBudgetBreakdown } from "../api/planHooks";
import type { BudgetCategoryBreakdownResponse, PlanRequest } from "../api/types";

type BudgetBreakdownCardProps = {
  request: PlanRequest | null;
};

const statusStyles: Record<string, { label: string; className: string }> = {
  tight: {
    label: "Tight",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
  balanced: {
    label: "Balanced",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  comfortable: {
    label: "Comfortable",
    className: "bg-leaf-50 text-leaf-700 ring-leaf-50",
  },
};

export function BudgetBreakdownCard({ request }: BudgetBreakdownCardProps) {
  const budgetBreakdown = useBudgetBreakdown(request);
  const errorMessage = budgetBreakdown.isError
    ? getApiErrorMessages(budgetBreakdown.error).message
    : undefined;
  const status = budgetBreakdown.data
    ? (statusStyles[budgetBreakdown.data.budget_status] ?? {
        label: formatLabel(budgetBreakdown.data.budget_status),
        className: "bg-mist-50 text-ink-700 ring-mist-200",
      })
    : undefined;

  return (
    <article className="dashboard-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-ink-500">
            Grocery allocation
          </p>
          <h4 className="mt-1 text-lg font-semibold text-ink-900">Budget breakdown</h4>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <BadgeDollarSign aria-hidden={true} className="h-5 w-5" />
        </div>
      </div>

      {!request ? <EmptyState /> : null}
      {request && budgetBreakdown.isLoading ? <LoadingState /> : null}
      {request && errorMessage ? (
        <ErrorState message={errorMessage} onRetry={() => void budgetBreakdown.refetch()} />
      ) : null}
      {budgetBreakdown.data ? (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <PlanMetric label="Weekly" value={formatMoney(budgetBreakdown.data.weekly_budget)} />
            <PlanMetric label="Daily" value={formatMoney(budgetBreakdown.data.daily_budget)} />
            <PlanMetric
              label="$/1000 cal"
              value={formatMoney(budgetBreakdown.data.dollars_per_1000_calories)}
            />
          </div>

          {status ? (
            <div className="rounded-lg bg-mist-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <Scale aria-hidden={true} className="mt-0.5 h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Budget fit</p>
                    <p className="mt-1 text-sm leading-6 text-ink-700">
                      {budgetBreakdown.data.budget_status_detail}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-fit rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-normal ring-1 ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
            </div>
          ) : null}

          <section aria-labelledby="budget-categories-title" className="space-y-3">
            <div className="flex items-center gap-2">
              <WalletCards aria-hidden={true} className="h-4 w-4 text-amber-700" />
              <h5 id="budget-categories-title" className="text-sm font-semibold text-ink-900">
                Category mapping
              </h5>
            </div>
            <div className="space-y-3">
              {budgetBreakdown.data.categories.map((category) => (
                <BudgetCategory key={category.category} category={category} />
              ))}
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
      Enter valid profile inputs to load grocery budget details.
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-5 space-y-3" aria-live="polite" aria-busy={true}>
      <div className="h-16 animate-pulse rounded-lg bg-mist-100" />
      <div className="h-24 animate-pulse rounded-lg bg-mist-100" />
      <div className="h-24 animate-pulse rounded-lg bg-mist-100" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle aria-hidden={true} className="mt-0.5 h-5 w-5 text-red-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-900">Budget breakdown could not load</p>
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

function BudgetCategory({ category }: { category: BudgetCategoryBreakdownResponse }) {
  return (
    <div className="rounded-lg border border-mist-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h6 className="text-sm font-semibold text-ink-900">{formatLabel(category.category)}</h6>
          <p className="mt-1 text-sm leading-6 text-ink-700">{category.grocery_need}</p>
        </div>
        <p className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-700">
          {formatMoney(category.allocated_amount)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <CategoryMetric label="Share" value={`${category.allocation_percent}%`} />
        <CategoryMetric label="Portions" value={String(category.target_weekly_portions)} />
        <CategoryMetric label="Each" value={formatMoney(category.dollars_per_portion)} />
      </div>
    </div>
  );
}

function CategoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-mist-50 px-2 py-2">
      <p className="truncate text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function formatMoney(value: string) {
  return `$${Number(value).toFixed(2)}`;
}

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
