import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({ title = "Loading", description = "Preparing your collection workspace..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-8 text-center text-slate-300">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-amber-300" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
    </div>
  );
}
