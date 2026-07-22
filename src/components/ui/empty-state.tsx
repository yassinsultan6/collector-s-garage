import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title = "No items yet", description = "Add your first entry to begin managing the collection.", action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/40 p-8 text-center text-slate-300">
      <Sparkles className="mb-4 h-8 w-8 text-amber-300" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
