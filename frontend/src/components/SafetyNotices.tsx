import { AlertTriangle, CircleDollarSign } from "lucide-react";

const notices = [
  {
    title: "Health guidance",
    body: "This planning tool is not a substitute for professional medical, fitness, or nutrition advice. Check with a qualified professional before changing training, diet, or care plans.",
    icon: AlertTriangle,
  },
  {
    title: "Cost estimates",
    body: "Grocery and meal prep costs are general planning estimates based on the built-in catalog, not live store pricing or guaranteed local availability.",
    icon: CircleDollarSign,
  },
];

export function SafetyNotices() {
  return (
    <section
      aria-label="Safety and estimate notices"
      className="border-b border-mist-200 bg-mist-50"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-2 lg:px-8">
        {notices.map((notice) => {
          const Icon = notice.icon;

          return (
            <div key={notice.title} className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-ocean-700 shadow-sm">
                <Icon aria-hidden={true} className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{notice.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-700">{notice.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
