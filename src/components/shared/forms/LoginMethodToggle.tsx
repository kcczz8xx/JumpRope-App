"use client";

interface ToggleOption {
  value: string;
  label: string;
}

interface LoginMethodToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
}

export function LoginMethodToggle({
  value,
  onChange,
  options,
}: LoginMethodToggleProps) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
