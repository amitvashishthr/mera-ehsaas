"use client";

const steps = [
  { key: "pending", label: "Pending", icon: "⏳" },
  { key: "approved", label: "Approved", icon: "✓" },
  { key: "printing", label: "Printing", icon: "🖨️" },
  { key: "shipped", label: "Shipped", icon: "📦" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

interface OrderTimelineProps {
  currentStatus: string;
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const isCancelled = currentStatus === "cancelled";
  const currentIdx = steps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {isCancelled ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
          <span className="text-lg">❌</span>
          <span className="text-sm font-medium text-rose-700 dark:text-rose-300">Order Cancelled</span>
        </div>
      ) : (
        steps.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all ${
                    isCurrent
                      ? "bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-warm-200 dark:bg-dark-600 text-primary-400 dark:text-dark-400"
                  }`}
                >
                  {isCompleted && !isCurrent ? "✓" : step.icon}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${
                  isCurrent ? "text-primary-800 dark:text-primary-300" : "text-primary-400 dark:text-dark-400"
                }`}>
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${
                  idx < currentIdx ? "bg-green-400" : "bg-warm-200 dark:bg-dark-600"
                }`} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
