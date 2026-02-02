/**
 * useFormSubmit Hook
 * 統一處理表單提交、防重複提交、錯誤處理
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { toast, type ApiResult } from "@/lib/client";

interface UseFormSubmitOptions<TData, TResult> {
  onSubmit: (data: TData) => Promise<ApiResult<TResult>>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface UseFormSubmitReturn<TData> {
  isSubmitting: boolean;
  submit: (data: TData) => Promise<boolean>;
  reset: () => void;
}

export function useFormSubmit<TData, TResult = unknown>({
  onSubmit,
  onSuccess,
  onError,
  successMessage = "儲存成功",
  errorMessage,
  showSuccessToast = true,
  showErrorToast = true,
}: UseFormSubmitOptions<TData, TResult>): UseFormSubmitReturn<TData> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const submit = useCallback(
    async (data: TData): Promise<boolean> => {
      if (submitLockRef.current || isSubmitting) {
        return false;
      }

      submitLockRef.current = true;
      setIsSubmitting(true);

      try {
        const result = await onSubmit(data);

        if (result.error) {
          const displayError = errorMessage || result.error;
          if (showErrorToast) {
            toast.error(displayError);
          }
          onError?.(displayError);
          return false;
        }

        if (showSuccessToast) {
          toast.success(successMessage);
        }
        onSuccess?.(result.data as TResult);
        return true;
      } catch (error) {
        const displayError =
          errorMessage ||
          (error instanceof Error ? error.message : "操作失敗，請稍後再試");
        if (showErrorToast) {
          toast.error(displayError);
        }
        onError?.(displayError);
        return false;
      } finally {
        setIsSubmitting(false);
        submitLockRef.current = false;
      }
    },
    [
      onSubmit,
      onSuccess,
      onError,
      successMessage,
      errorMessage,
      showSuccessToast,
      showErrorToast,
    ]
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    submitLockRef.current = false;
  }, []);

  return {
    isSubmitting,
    submit,
    reset,
  };
}

interface UseAsyncSubmitOptions<TResult> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAsyncSubmit<TResult = unknown>({
  onSuccess,
  onError,
  successMessage = "操作成功",
  showSuccessToast = true,
  showErrorToast = true,
}: UseAsyncSubmitOptions<TResult> = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const lockRef = useRef(false);

  const execute = useCallback(
    async (
      asyncFn: () => Promise<ApiResult<TResult>>
    ): Promise<TResult | null> => {
      if (lockRef.current || isLoading) {
        return null;
      }

      lockRef.current = true;
      setIsLoading(true);

      try {
        const result = await asyncFn();

        if (result.error) {
          if (showErrorToast) {
            toast.error(result.error);
          }
          onError?.(result.error);
          return null;
        }

        if (showSuccessToast) {
          toast.success(successMessage);
        }
        onSuccess?.(result.data as TResult);
        return result.data as TResult;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "操作失敗，請稍後再試";
        if (showErrorToast) {
          toast.error(errorMsg);
        }
        onError?.(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
        lockRef.current = false;
      }
    },
    [onSuccess, onError, successMessage, showSuccessToast, showErrorToast, isLoading]
  );

  return {
    isLoading,
    execute,
  };
}
