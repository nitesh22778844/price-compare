import { useRef, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { clsx } from "clsx";
import { STRINGS } from "../../lib/strings";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!disabled && value.trim()) onSubmit();
  }

  function handleInput() {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2.5 border-t border-slate-200 bg-white/80 backdrop-blur-md p-4"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={disabled ? STRINGS.typingIndicatorLabel : STRINGS.chatPlaceholder}
        disabled={disabled}
        rows={1}
        className={clsx(
          "flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-2.5 bg-white",
          "text-sm text-slate-900 placeholder:text-slate-400 caret-indigo-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/35 focus:border-indigo-400",
          "transition-all duration-150 overflow-hidden shadow-sm",
          disabled && "opacity-60 cursor-not-allowed"
        )}
        aria-label={STRINGS.chatPlaceholder}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={clsx(
          "w-10 h-10 flex items-center justify-center rounded-2xl flex-shrink-0",
          "bg-gradient-to-br from-indigo-500 to-violet-600 text-white transition-all duration-200",
          "hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-white",
          (disabled || !value.trim()) && "opacity-40 cursor-not-allowed hover:scale-100 hover:shadow-none"
        )}
        aria-label={STRINGS.chatSendLabel}
      >
        <Send size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
