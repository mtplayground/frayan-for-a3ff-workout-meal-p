import { useState } from "react";

import type { PlanRequest } from "../api/types";
import { BudgetBreakdownCard } from "../components/BudgetBreakdownCard";
import { InputPanel } from "../components/InputPanel";
import { MealPrepCard } from "../components/MealPrepCard";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";

type TabId = "inputs" | "results";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "inputs", label: "Inputs" },
  { id: "results", label: "Results" },
];

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("inputs");
  const [planRequest, setPlanRequest] = useState<PlanRequest | null>(null);

  return (
    <section aria-labelledby="dashboard-title" className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-leaf-700">Plan workspace</p>
          <h2 id="dashboard-title" className="text-2xl font-semibold text-ink-900 sm:text-3xl">
            Workout, meals, and budget
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-mist-200 bg-white p-2 shadow-sm sm:w-96">
          <Metric label="Daily calories" value="2,350" />
          <Metric label="Protein" value="160g" />
          <Metric label="Weekly spend" value="$125" />
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-lg border border-mist-200 bg-white p-1 shadow-sm lg:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            className={[
              "h-10 rounded-md text-sm font-semibold transition",
              activeTab === tab.id
                ? "bg-ocean-700 text-white"
                : "text-ink-600 hover:bg-mist-100 hover:text-ink-900",
            ].join(" ")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className={activeTab === "inputs" ? "block" : "hidden lg:block"}>
          <InputPanel onValidRequestChange={setPlanRequest} />
        </aside>

        <div className={activeTab === "results" ? "block" : "hidden lg:block"}>
          <ResultsPanel planRequest={planRequest} />
        </div>
      </div>
    </section>
  );
}

function ResultsPanel({ planRequest }: { planRequest: PlanRequest | null }) {
  return (
    <section aria-labelledby="results-panel-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-leaf-700">Results</p>
          <h3 id="results-panel-title" className="text-xl font-semibold text-ink-900">
            Plan cards
          </h3>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <WorkoutPlanCard request={planRequest} />
        <MealPrepCard request={planRequest} />
        <BudgetBreakdownCard request={planRequest} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-mist-50 px-3 py-2">
      <p className="truncate text-xs font-medium text-ink-500">{label}</p>
      <p className="text-base font-semibold text-ink-900">{value}</p>
    </div>
  );
}
