import { useChat } from "../hooks/useChat";
import { ChatWindow } from "../components/chat/ChatWindow";
import { ComparisonTable } from "../components/results/ComparisonTable";
import { STRINGS } from "../lib/strings";

export default function App() {
  const { messages, input, setInput, isLoading, sendMessage, submitExample, productSearch } =
    useChat();

  const resultCount = productSearch.results.length;
  const storeCount = new Set(productSearch.results.map((r) => r.source)).size;

  return (
    <div className="flex flex-col h-screen overflow-hidden app-bg">
      {/* Top bar */}
      <header className="glass-strong border-b border-white/10 px-6 py-3.5 flex items-center gap-3 flex-shrink-0 relative z-20">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 flex-shrink-0">
          <span className="text-white text-xs font-bold tracking-tight">PC</span>
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight leading-none">
            {STRINGS.appTitle}
          </h1>
          <p className="text-[11px] text-white/40 mt-1 leading-none">
            Smart price comparison · powered by AI
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-white/60 tracking-widest uppercase font-semibold px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60 animate-pulse" />
            Live
          </span>
        </div>
      </header>

      {/* Main two-pane layout */}
      <main className="flex flex-1 overflow-hidden relative z-10">
        {/* Left pane — chat (38%) */}
        <section
          className="w-full lg:w-[38%] flex-shrink-0 border-r border-white/10 flex flex-col overflow-hidden"
          aria-label="Chat panel"
        >
          <ChatWindow
            messages={messages}
            inputValue={input}
            onInputChange={setInput}
            onSubmit={() => sendMessage(input)}
            isLoading={isLoading}
            onExampleClick={submitExample}
          />
        </section>

        {/* Right pane — comparison table (62%) */}
        <section
          className="hidden lg:flex flex-1 flex-col overflow-hidden"
          aria-label="Product comparison panel"
        >
          {/* Pane header */}
          <div className="px-6 py-4 border-b border-white/10 glass flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-[15px] font-semibold text-white tracking-tight">
                Product Comparison
              </h2>
              {resultCount > 0 ? (
                <p className="text-xs text-white/50 mt-1">
                  <span className="text-white/80 font-medium">{resultCount}</span> result
                  {resultCount !== 1 ? "s" : ""} across{" "}
                  <span className="text-white/80 font-medium">{storeCount}</span> store
                  {storeCount !== 1 ? "s" : ""}
                </p>
              ) : (
                <p className="text-xs text-white/40 mt-1">
                  Ask the assistant about a product to see comparisons here
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ComparisonTable
              results={productSearch.results}
              loading={productSearch.loading}
              error={productSearch.error}
            />
          </div>
        </section>

        {/* Mobile: table below chat */}
        <section
          className="lg:hidden w-full border-t border-white/10"
          aria-label="Product comparison (mobile)"
        >
          <ComparisonTable
            results={productSearch.results}
            loading={productSearch.loading}
            error={productSearch.error}
          />
        </section>
      </main>
    </div>
  );
}
