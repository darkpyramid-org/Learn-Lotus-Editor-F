import { createRoot } from "react-dom/client";
import { Suspense, lazy } from "react";
import { AppShellLoader } from "./components/AppShellLoader";

// Minimal CSS for instant loading
import "./index.css";

// Ultra-lazy load the main app so Vite doesn't freeze the first boot
const App = lazy(() => import("./App"));

function Root() {
  return (
    <Suspense fallback={<AppShellLoader />}>
      <App />
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
