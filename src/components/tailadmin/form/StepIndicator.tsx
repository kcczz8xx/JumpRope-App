"use client";

import React from "react";

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="space-y-6 py-4 mb-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex flex-col items-center ${
                onStepClick && index < currentStep ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (onStepClick && index < currentStep) {
                  onStepClick(index);
                }
              }}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  index < currentStep
                    ? "border-brand-500 bg-brand-500 text-white"
                    : index === currentStep
                    ? "border-brand-500 bg-white text-brand-500 dark:bg-gray-900"
                    : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-900"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  index <= currentStep
                    ? "text-gray-800 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {step.description}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 w-16 sm:w-24 ${
                  index < currentStep
                    ? "bg-brand-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
