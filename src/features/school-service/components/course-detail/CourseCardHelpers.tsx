import React from "react";
import { CHARGING_MODEL_MAP, QuickAction } from "./types";

export const formatDate = (date: Date | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between py-1">
    <span className="text-theme-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-theme-sm font-medium text-gray-800 dark:text-white text-right">
      {value}
    </span>
  </div>
);

export const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-theme-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>課堂進度</span>
        <span>{completed}/{total} 堂 ({percentage}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-1.5 rounded-full bg-brand-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const QuickActionButton = ({ action }: { action: QuickAction }) => (
  <button
    type="button"
    onClick={action.onClick}
    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-medium text-gray-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
  >
    {action.icon}
    <span>{action.label}</span>
  </button>
);

export const FeeCard = ({ model, amount }: { model: string; amount: number | null | undefined }) => {
  const modelInfo = CHARGING_MODEL_MAP[model];
  if (!modelInfo || amount === null || amount === undefined) return null;
  
  return (
    <div className="rounded-lg border border-brand-100 bg-brand-25 p-3 dark:border-brand-800 dark:bg-brand-950/30">
      <div className="flex items-center justify-between">
        <span className="text-theme-sm font-medium text-gray-800 dark:text-white">
          {modelInfo.label}
        </span>
        <span className="text-theme-sm font-semibold text-brand-600 dark:text-brand-400">
          {formatCurrency(amount)}
        </span>
      </div>
      <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
        {modelInfo.desc}
      </p>
    </div>
  );
};
