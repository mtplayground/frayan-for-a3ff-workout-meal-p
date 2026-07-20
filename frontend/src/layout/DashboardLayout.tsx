import { Activity, LayoutDashboard } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { SafetyNotices } from "../components/SafetyNotices";

const navigationItems = [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-app-canvas text-ink-900">
      <header className="border-b border-mist-200 bg-white/95 shadow-sm">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean-600 text-white shadow-sm">
              <Activity aria-hidden={true} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-leaf-700">
                Health planner
              </p>
              <h1 className="text-lg font-semibold text-ink-900">Workout and meal dashboard</h1>
            </div>
          </div>
          <nav aria-label="Primary navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-ocean-700 text-white shadow-sm"
                        : "text-ink-600 hover:bg-mist-100 hover:text-ink-900",
                    ].join(" ")
                  }
                >
                  <Icon aria-hidden={true} className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
      <SafetyNotices />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
