"use client";

import React from "react";

interface FormCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({
  title,
  description,
  children,
  className = "",
}: FormCardProps) {
  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 ${className}`}>
        {(title || description) && (
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            {title && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6 dark:border-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
}
