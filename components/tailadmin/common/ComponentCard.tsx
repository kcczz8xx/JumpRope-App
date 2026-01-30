import React from "react";
import Link from "next/link";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  headerAction?: React.ReactNode;
  actionLink?: {
    href: string;
    label: string;
  };
  noPadding?: boolean;
  noBodyBorder?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  headerAction,
  actionLink,
  noPadding = false,
  noBodyBorder = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
        {actionLink && (
          <Link
            href={actionLink.href}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {actionLink.label}
          </Link>
        )}
      </div>

      {/* Card Body */}
      <div
        className={`${noPadding ? "pt-4 sm:pt-6" : "p-4 sm:p-6"} ${
          noBodyBorder ? "" : "border-t border-gray-100 dark:border-gray-800"
        }`}
      >
        <div className={noPadding ? "" : "space-y-6"}>{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
