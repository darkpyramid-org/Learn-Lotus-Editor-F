/**
 * AppShellLoader.tsx - Ultra-minimal shell that loads instantly
 * Shows UI smoothly while heavy components load in background
 */

export function AppShellLoader() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#fdfaf5]">
      {/* Instant Header */}
      <header className="border-b border-amber-200 bg-white/80 backdrop-blur-sm h-14 flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2 select-none">
          <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center shadow-md">
            <span className="text-sm text-white font-black">𓂀</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-[0.15em] leading-none">Lotus</span>
            <span className="text-[8px] font-bold text-amber-600/60 uppercase tracking-tighter">Editor</span>
          </div>
        </div>
        <div className="ml-auto text-[10px] text-amber-600/60 font-medium">Loading Application...</div>
      </header>

      {/* Instant Content Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse text-amber-600">𓆸</div>
          <div className="text-lg font-medium text-amber-800 mb-2">Initializing Lotus Editor</div>
          <div className="text-sm text-amber-600/70">Waking up components...</div>
          <div className="w-48 h-2 bg-amber-200 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
