import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({ title = "Something went wrong", description = "Please try again in a moment.", action }: ErrorStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-8 text-center text-slate-200">
      <AlertTriangle className="mb-4 h-8 w-8 text-rose-300" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
