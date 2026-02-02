import React from "react";
import Button from "@/components/tailadmin/ui/button/Button";
import Link from "next/link";
import { DataTableAction } from "./types";

interface DataTableHeaderProps {
  title?: string;
  description?: string;
  actions?: DataTableAction[];
}

export const DataTableHeader: React.FC<DataTableHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  if (!title && !description && !actions?.length) return null;

  return (
    <div className="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800">
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action, index) => {
            const buttonContent = (
              <>
                {action.icon}
                {action.label}
              </>
            );

            if (action.href) {
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    action.variant === "outline"
                      ? "shadow-theme-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/5"
                      : "bg-brand-500 text-white shadow-sm hover:bg-brand-600"
                  }`}
                >
                  {buttonContent}
                </Link>
              );
            }

            return (
              <Button
                key={index}
                variant={action.variant || "primary"}
                onClick={action.onClick}
              >
                {buttonContent}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
