import { Loader2 } from "lucide-react";

export default function ResultBlock({ title, children, isLoading = false }) {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg mt-4 min-h-[80px] relative">
      <h3 className="text-sm font-semibold text-cyan-300 mb-2">{title}</h3>
      <div className="text-slate-200 text-sm prose prose-invert prose-sm max-w-none">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg">
            <Loader2 className="w-6 h-6 text-cyan-300 animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
