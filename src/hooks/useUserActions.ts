/**
 * useUserActions Hook
 * 用戶資料更新操作（使用 Server Actions）
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  updateProfileAction,
  updateAddressAction,
  deleteAddressAction,
  updateBankAction,
  deleteBankAction,
  createChildAction,
  updateChildAction,
  deleteChildAction,
} from "@/features/user";
import { changePasswordAction } from "@/features/auth";

import type {
  UpdateProfileInput,
  UpdateAddressInput,
  UpdateBankInput,
  CreateChildInput,
  UpdateChildInput,
  DeleteChildInput,
} from "@/features/user";

interface UseActionOptions {
  onSuccess?: () => void;
  successMessage?: string;
}

function useServerAction<TInput, TResult>(
  action: (input: TInput) => Promise<{ ok: boolean; data?: TResult; error?: { message: string } }>,
  options: UseActionOptions = {}
) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submit = async (input: TInput) => {
    setIsSubmitting(true);
    try {
      const result = await action(input);
      if (result.ok) {
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        startTransition(() => {
          router.refresh();
        });
        options.onSuccess?.();
        return result;
      } else {
        toast.error(result.error?.message || "操作失敗");
        return result;
      }
    } catch (error) {
      toast.error("操作失敗，請稍後再試");
      return { ok: false, error: { message: "操作失敗" } };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting: isSubmitting || isPending, submit };
}

/**
 * 更新個人資料
 */
export function useUpdateProfile(onSuccess?: () => void) {
  return useServerAction<Partial<UpdateProfileInput>, unknown>(
    updateProfileAction,
    { onSuccess, successMessage: "個人資料已更新" }
  );
}

/**
 * 更新地址
 */
export function useUpdateAddress(onSuccess?: () => void) {
  return useServerAction<UpdateAddressInput, unknown>(
    updateAddressAction,
    { onSuccess, successMessage: "地址已更新" }
  );
}

/**
 * 刪除地址
 */
export function useDeleteAddress(onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const result = await deleteAddressAction();
      if (result.ok) {
        toast.success("地址已刪除");
        startTransition(() => {
          router.refresh();
        });
        onSuccess?.();
        return result;
      } else {
        toast.error(result.error?.message || "操作失敗");
        return result;
      }
    } catch {
      toast.error("操作失敗，請稍後再試");
      return { ok: false, error: { message: "操作失敗" } };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting: isSubmitting || isPending, submit };
}

/**
 * 更新收款資料
 */
export function useUpdateBank(onSuccess?: () => void) {
  return useServerAction<UpdateBankInput, unknown>(
    updateBankAction,
    { onSuccess, successMessage: "收款資料已更新" }
  );
}

/**
 * 刪除收款資料
 */
export function useDeleteBank(onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const result = await deleteBankAction();
      if (result.ok) {
        toast.success("收款資料已刪除");
        startTransition(() => {
          router.refresh();
        });
        onSuccess?.();
        return result;
      } else {
        toast.error(result.error?.message || "操作失敗");
        return result;
      }
    } catch {
      toast.error("操作失敗，請稍後再試");
      return { ok: false, error: { message: "操作失敗" } };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting: isSubmitting || isPending, submit };
}

/**
 * 新增學員
 */
export function useCreateChild(onSuccess?: () => void) {
  return useServerAction<CreateChildInput, unknown>(
    createChildAction,
    { onSuccess, successMessage: "學員已新增" }
  );
}

/**
 * 更新學員資料
 */
export function useUpdateChild(onSuccess?: () => void) {
  return useServerAction<UpdateChildInput, unknown>(
    updateChildAction,
    { onSuccess, successMessage: "學員資料已更新" }
  );
}

/**
 * 刪除學員
 */
export function useDeleteChild(onSuccess?: () => void) {
  return useServerAction<DeleteChildInput, unknown>(
    deleteChildAction,
    { onSuccess, successMessage: "學員已刪除" }
  );
}

/**
 * 修改密碼
 */
export function useChangePassword(onSuccess?: () => void) {
  return useServerAction<{ currentPassword: string; newPassword: string }, unknown>(
    changePasswordAction,
    { onSuccess, successMessage: "密碼修改成功" }
  );
}
