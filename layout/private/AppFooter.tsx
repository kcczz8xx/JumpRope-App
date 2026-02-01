"use client";

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="px-4 md:px-6 mx-auto w-full max-w-(--breakpoint-2xl)">
      <footer className="rounded-t-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
          <p>© 香港跳繩學院 {currentYear}</p>
          <p>Hong Kong Jump Rope Academy</p>
        </div>
      </footer>
    </div>
  );
}
