import { Suspense, lazy } from "react";
import { Route, Switch, Redirect } from "wouter";
import { AppShellLoader } from "@/components/AppShellLoader";

const HomePage = lazy(() => import("@/pages/HomePage"));
const EditorPage = lazy(() => import("@/pages/EditorPage"));

function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-[#fdfaf5]">
      <div className="text-5xl">𓆸</div>
      <h1 className="text-xl font-black text-amber-950 uppercase tracking-widest">Page not found</h1>
      <a href="/" className="text-sm font-bold text-amber-700 underline underline-offset-4">
        Back to Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<AppShellLoader />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/editor">
          <EditorPage />
        </Route>
        <Route path="/home">
          <Redirect to="/" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
