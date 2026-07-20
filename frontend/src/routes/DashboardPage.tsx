const emptySections = ["Inputs", "Workout plan", "Meal prep", "Budget"];

export function DashboardPage() {
  return (
    <section aria-labelledby="dashboard-title" className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-teal-700">Workspace</p>
        <h2 id="dashboard-title" className="text-3xl font-semibold tracking-normal text-slate-950">
          Dashboard shell
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          The dashboard layout and route are ready. Interactive planning modules will be added in
          the feature issues that define their data and behavior.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {emptySections.map((section) => (
          <article
            key={section}
            className="min-h-40 rounded-lg border border-dashed border-slate-300 bg-white p-5"
          >
            <p className="text-sm font-semibold text-slate-900">{section}</p>
            <div className="mt-6 h-2 w-20 rounded bg-slate-200" aria-hidden="true" />
            <div className="mt-3 h-2 w-32 rounded bg-slate-100" aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}
