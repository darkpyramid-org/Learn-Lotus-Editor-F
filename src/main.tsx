import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import { AppShell } from "./components/AppShell";

// Minimal CSS for instant loading
import "./index.css";

// Ultra-lazy load the main app
const App = lazy(() => import("./App"));

// Instant shell with progressive loading
function Root() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
