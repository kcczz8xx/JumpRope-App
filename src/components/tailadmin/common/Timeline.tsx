import React from "react";

export interface TimelineItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  date: string;
  iconRounded?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  return (
    <>
      {items.map((item, index) => (
        <div
          key={index}
          className={`group relative flex ${item.description ? 'items-start' : 'items-center'} gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800`}
        >
          {index < items.length - 1 && (
            <div className="absolute left-[36px] top-[58px] -bottom-[60px] w-px border-l border-dashed border-gray-300 dark:border-gray-700"></div>
          )}
          
          <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center ${item.iconRounded !== false ? 'rounded-full' : 'rounded-lg'} border-2 border-gray-50 bg-white text-gray-700 ring ring-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-800`}>
            {item.icon}
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-800 dark:text-white/90">
              {item.title}
            </h4>
            {item.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col text-right text-xs text-gray-400 dark:text-gray-500">
            <span>{item.time}</span>
            <span>{item.date}</span>
          </div>
        </div>
      ))}
    </>
  );
}
