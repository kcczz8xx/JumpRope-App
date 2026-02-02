"use client";
import React from "react";
import Link from "next/link";
import Button from "@/components/tailadmin/ui/button/Button";

export default function ResetPasswordSuccessStep() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-success-50 p-4 dark:bg-success-500/10">
        <div className="flex items-center gap-3">
          <svg
            className="h-6 w-6 text-success-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-success-600 dark:text-success-400">
            您的密碼已成功重設
          </p>
        </div>
      </div>

      <div>
        <Link href="/signin">
          <Button className="w-full" size="sm">
            返回登入
          </Button>
        </Link>
      </div>
    </div>
  );
}
