import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import "./index.css";

// Lazy load the main App component
const App = lazy(() => import("./App"));

// Lazy load PWA registration
const registerPWA = async () => {
  if ('serviceWorker' in navigator) {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({
      onNeedRefresh() {
        console.log("New content available, please refresh.");
      },
      onOfflineReady() {
        console.log("App ready to work offline.");
      },
    });
  }
};

// Register PWA after initial load
setTimeout(registerPWA, 1000);

// Loading component
function AppLoader() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#fdfaf5]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl animate-pulse text-amber-600">𓆸</div>
        <div className="text-sm font-medium text-amber-800">Loading Lotus Editor...</div>
        <div className="w-32 h-1 bg-amber-200 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<AppLoader />}>
    <App />
  </Suspense>
);
