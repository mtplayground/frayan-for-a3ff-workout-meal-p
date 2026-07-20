import { Apple, BadgeDollarSign, Dumbbell } from "lucide-react";
import { type ComponentType, useState } from "react";

import { InputPanel } from "../components/InputPanel";

type TabId = "inputs" | "results";

type ResultCard = {
  title: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  tone: "ocean" | "leaf" | "amber";
  stats: Array<{ label: string; value: string }>;
  rows: string[];
};

const resultCards: ResultCard[] = [
  {
    title: "Workout plan",
    label: "Upper body focus",
    icon: Dumbbell,
    tone: "ocean",
    stats: [
      { label: "Exercises", value: "4" },
      { label: "Effort", value: "Moderate" },
    ],
    rows: ["Push pattern", "Pull pattern", "Shoulder stability"],
  },
  {
    title: "Meal prep",
    label: "Weekly prep",
    icon: Apple,
    tone: "leaf",
    stats: [
      { label: "Meals", value: "14" },
      { label: "Calories", value: "2,350" },
    ],
    rows: ["Proteins", "Carbs", "Veggies", "Staples"],
  },
  {
    title: "Budget",
    label: "Grocery allocation",
    icon: BadgeDollarSign,
    tone: "amber",
    stats: [
      { label: "Weekly", value: "$125" },
      { label: "Status", value: "Balanced" },
    ],
    rows: ["40% proteins", "25% carbs", "20% vegetables"],
  },
];

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "inputs", label: "Inputs" },
  { id: "results", label: "Results" },
];

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("inputs");

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
          <InputPanel />
        </aside>

        <div className={activeTab === "results" ? "block" : "hidden lg:block"}>
          <ResultsPanel />
        </div>
      </div>
    </section>
  );
}

function ResultsPanel() {
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
        {resultCards.map((card) => (
          <ResultCardView key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

function ResultCardView({ card }: { card: ResultCard }) {
  const Icon = card.icon;
  const toneClass = {
    ocean: "bg-ocean-50 text-ocean-700",
    leaf: "bg-leaf-50 text-leaf-700",
    amber: "bg-amber-50 text-amber-700",
  }[card.tone];

  return (
    <article className="dashboard-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-ink-500">
            {card.label}
          </p>
          <h4 className="mt-1 text-lg font-semibold text-ink-900">{card.title}</h4>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon aria-hidden={true} className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {card.stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-mist-50 p-3">
            <p className="text-xs font-medium text-ink-500">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold text-ink-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        {card.rows.map((row) => (
          <div key={row} className="flex items-center gap-2 text-sm font-medium text-ink-700">
            <span className="h-2 w-2 rounded-full bg-leaf-500" aria-hidden={true} />
            {row}
          </div>
        ))}
      </div>
    </article>
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
