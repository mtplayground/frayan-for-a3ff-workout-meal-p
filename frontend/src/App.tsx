import "./styles.css";

export function App() {
  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="status-heading">
        <p className="eyebrow">Monorepo initialized</p>
        <h1 id="status-heading">React frontend and FastAPI backend are ready for feature work.</h1>
        <p>
          This first issue establishes the local development structure. Product UI and domain
          workflows will be implemented in later issues.
        </p>
      </section>
    </main>
  );
}
