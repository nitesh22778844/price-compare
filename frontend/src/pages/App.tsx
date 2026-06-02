import { useState, useEffect, useRef } from "react";
import { Sparkles, MessageSquare, LayoutGrid } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useRecommendations } from "../hooks/useRecommendations";
import { ChatWindow } from "../components/chat/ChatWindow";
import { ComparisonTable } from "../components/results/ComparisonTable";
import { RecommendationsDrawer } from "../components/recommendations/RecommendationsDrawer";
import { STRINGS } from "../lib/strings";

type MobileTab = "chat" | "results";

export default function App() {
  const { messages, input, setInput, isLoading, sendMessage, submitExample, productSearch } =
    useChat();
  const recommendations = useRecommendations();
  const [recsOpen, setRecsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("chat");

  const resultCount = productSearch.results.length;
  const storeCount = new Set(productSearch.results.map((r) => r.source)).size;

  // On mobile, jump to the results tab as soon as a search starts so the user
  // sees the loading state and results instead of staying on the chat pane.
  const prevLoading = useRef(false);
  useEffect(() => {
    if (productSearch.loading && !prevLoading.current) {
      setActiveTab("results");
    }
    prevLoading.current = productSearch.loading;
  }, [productSearch.loading]);

  return (
    <div className="flex flex-col h-screen overflow-hidden app-bg">
      {/* Top bar */}
      <header className="glass-strong border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center gap-3 flex-shrink-0 relative z-20">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
          <span className="text-white text-xs font-bold tracking-tight">PC</span>
        </div>
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold text-slate-900 tracking-tight leading-none truncate">
            {STRINGS.appTitle}
          </h1>
          <p className="text-[11px] text-slate-500 mt-1 leading-none truncate">
            Smart price comparison · powered by AI
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setRecsOpen(true)}
            aria-label={STRINGS.recommendationsButton}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 glow-indigo hover:from-indigo-600 hover:to-violet-700 transition"
          >
            <Sparkles size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{STRINGS.recommendationsButton}</span>
          </button>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-slate-600 tracking-widest uppercase font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 animate-pulse" />
            Live
          </span>
        </div>
      </header>

      {/* Mobile tab switcher (hidden on desktop two-pane layout) */}
      <div className="lg:hidden flex-shrink-0 flex items-stretch border-b border-slate-200 glass relative z-10">
        <TabButton
          active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
          icon={<MessageSquare size={15} aria-hidden="true" />}
          label="Chat"
        />
        <TabButton
          active={activeTab === "results"}
          onClick={() => setActiveTab("results")}
          icon={<LayoutGrid size={15} aria-hidden="true" />}
          label="Results"
          badge={resultCount > 0 ? resultCount : undefined}
        />
      </div>

      {/* Main layout — two panes on desktop, one-at-a-time tabs on mobile */}
      <main className="flex flex-1 overflow-hidden relative z-10">
        {/* Chat pane */}
        <section
          className={`${
            activeTab === "chat" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[38%] flex-shrink-0 border-r border-slate-200 flex-col overflow-hidden bg-white/60`}
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

        {/* Comparison pane */}
        <section
          className={`${
            activeTab === "results" ? "flex" : "hidden"
          } lg:flex flex-1 flex-col overflow-hidden`}
          aria-label="Product comparison panel"
        >
          {/* Pane header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 glass flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">
                Product Comparison
              </h2>
              {resultCount > 0 ? (
                <p className="text-xs text-slate-500 mt-1">
                  <span className="text-slate-800 font-medium">{resultCount}</span> result
                  {resultCount !== 1 ? "s" : ""} across{" "}
                  <span className="text-slate-800 font-medium">{storeCount}</span> store
                  {storeCount !== 1 ? "s" : ""}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">
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
      </main>

      <RecommendationsDrawer
        open={recsOpen}
        onClose={() => setRecsOpen(false)}
        state={recommendations}
      />
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-indigo-500 text-indigo-600 bg-white/60"
          : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span
          className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
            active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
