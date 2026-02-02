/**
 * useUserProfile Hook
 * SWR-based 用戶資料獲取與更新
 */

"use client";

import useSWR from "swr";
import { api, type ApiResult } from "@/lib/client";
import { useFormSubmit } from "./useFormSubmit";
import type { UserInfoFormData, UserAddressFormData, UserBankFormData, UserChildFormData, ChangePasswordFormData } from "@/lib/validations";

interface UserProfile {
  id: string;
  memberNumber: string | null;
  title: string | null;
  phone: string;
  email: string | null;
  nameChinese: string | null;
  nameEnglish: string | null;
  nickname: string | null;
  gender: "MALE" | "FEMALE" | null;
  identityCardNumber: string | null;
  whatsappEnabled: boolean;
  role: string;
  address: UserAddress | null;
  bankAccount: UserBankAccount | null;
}

interface UserAddress {
  id: string;
  region: string | null;
  district: string | null;
  address: string | null;
}

interface UserBankAccount {
  id: string;
  bankName: string | null;
  accountNumber: string | null;
  accountHolderName: string | null;
  fpsId: string | null;
  fpsEnabled: boolean;
  notes: string | null;
}

interface UserChild {
  id: string;
  memberNumber: string | null;
  nameChinese: string;
  nameEnglish: string | null;
  birthYear: number | null;
  school: string | null;
  gender: "MALE" | "FEMALE" | null;
}

const fetcher = async <T>(url: string): Promise<T> => {
  const result = await api.get<T>(url);
  if (result.error) {
    throw new Error(result.error);
  }
  return result.data as T;
};

export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<{ user: UserProfile }>(
    "/api/user/profile",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    profile: data?.user,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useUpdateProfile(onSuccess?: () => void) {
  const { mutate } = useUserProfile();

  return useFormSubmit<Partial<UserInfoFormData>, UserProfile>({
    onSubmit: async (data) => {
      return api.patch<UserProfile>("/api/user/profile", data);
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "個人資料已更新",
  });
}

export function useUserAddress() {
  const { data, error, isLoading, mutate } = useSWR<{ address: UserAddress | null }>(
    "/api/user/address",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    address: data?.address,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useUpdateAddress(onSuccess?: () => void) {
  const { mutate } = useUserAddress();

  return useFormSubmit<UserAddressFormData, UserAddress>({
    onSubmit: async (data) => {
      return api.put<UserAddress>("/api/user/address", data);
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "地址已更新",
  });
}

export function useDeleteAddress(onSuccess?: () => void) {
  const { mutate } = useUserAddress();

  return useFormSubmit<void, void>({
    onSubmit: async () => {
      return api.delete<void>("/api/user/address");
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "地址已刪除",
  });
}

export function useUserBank() {
  const { data, error, isLoading, mutate } = useSWR<{ bankAccount: UserBankAccount | null }>(
    "/api/user/bank",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    bankAccount: data?.bankAccount,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useUpdateBank(onSuccess?: () => void) {
  const { mutate } = useUserBank();

  return useFormSubmit<UserBankFormData, UserBankAccount>({
    onSubmit: async (data) => {
      return api.put<UserBankAccount>("/api/user/bank", data);
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "收款資料已更新",
  });
}

export function useDeleteBank(onSuccess?: () => void) {
  const { mutate } = useUserBank();

  return useFormSubmit<void, void>({
    onSubmit: async () => {
      return api.delete<void>("/api/user/bank");
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "收款資料已刪除",
  });
}

export function useUserChildren() {
  const { data, error, isLoading, mutate } = useSWR<{ children: UserChild[] }>(
    "/api/user/children",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    children: data?.children ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

interface ChildFormData {
  id?: string;
  nameChinese: string;
  nameEnglish?: string;
  birthYear?: string;
  school?: string;
  gender?: "MALE" | "FEMALE" | "";
}

export function useCreateChild(onSuccess?: () => void) {
  const { mutate } = useUserChildren();

  return useFormSubmit<ChildFormData, UserChild>({
    onSubmit: async (data) => {
      return api.post<UserChild>("/api/user/children", data);
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "學員已新增",
  });
}

export function useUpdateChild(onSuccess?: () => void) {
  const { mutate } = useUserChildren();

  return useFormSubmit<ChildFormData, UserChild>({
    onSubmit: async (data) => {
      return api.put<UserChild>("/api/user/children", data);
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "學員資料已更新",
  });
}

export function useDeleteChild(onSuccess?: () => void) {
  const { mutate } = useUserChildren();

  return useFormSubmit<string, void>({
    onSubmit: async (childId) => {
      return api.delete<void>(`/api/user/children?id=${childId}`);
    },
    onSuccess: () => {
      mutate();
      onSuccess?.();
    },
    successMessage: "學員已刪除",
  });
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword(onSuccess?: () => void) {
  return useFormSubmit<ChangePasswordData, void>({
    onSubmit: async (data) => {
      return api.post<void>("/api/auth/change-password", data);
    },
    onSuccess: () => {
      onSuccess?.();
    },
    successMessage: "密碼修改成功",
  });
}
